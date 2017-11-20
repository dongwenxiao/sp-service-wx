import WX from 'sp-wx'
import AccessToken from './models/AccessToken'
import Ticket from './models/Ticket'
import WxUser from './models/WxUser'

const fs = require('fs')

const md5 = require('sp-functions/crypto/md5')
const randomString = require('sp-functions/random/string')
const moment = require('moment')

const debug = require('debug')('sp-service-wx:debug')

export default class WxService {

    mysql = null
    wx = null

    accessTokenModel = null
    ticketModel = null
    wxUserModel = null

    constructor({ mysql, appId, secret }) {

        this.mysql = mysql
        this.wx = new WX({ appId, secret })

        this.accessTokenModel = new AccessToken(mysql)
        this.ticketModel = new Ticket(mysql)
        this.wxUserModel = new WxUser(mysql)
    }

    getAuthorizeURL(redirect, state, scope) {
        return this.wx.getAuthorizeURL(redirect, state, scope)
    }

    async getOAuthAccessToken(code) {
        return await this.wx.getOAuthAccessToken(code)
    }

    async getAccessToken() {

        let accessToken

        // 从缓存取

        accessToken = await this.accessTokenModel.getLastOne()
        debug('从本地获取access_token: %O', accessToken)

        // 验证，存在并且验证通过

        if (accessToken) {
            debug('从本地获取access_token: 存在', accessToken)
            let pass = this.wx.validAccessToken(accessToken)
            if (pass) {
                debug('从本地获取access_token: 存在并验证通过')
                return accessToken
            }
            debug('从本地获取access_token: 存在并验证不通过')
        } else {
            debug('从本地获取access_token: 不存在')
        }

        // 失效 或者 不存在，远程获取

        accessToken = this.wx.getAccessToken()
        debug('从微信开放平台获取access_token: %O', accessToken)

        // 缓存并返回

        let id = await this.accessTokenModel.create(accessToken)
        if (id) {
            debug('从微信开放平台获取access_token缓存到本地:成功')
        } else {
            debug('从微信开放平台获取access_token缓存到本地:识别')
        }

        return accessToken
    }

    async getUserInfo(accessToken, openId) {

        debug('获取微信用户信息，参数: %o ; %o', accessToken, openId)
        let user

        // 从缓存读取

        user = await this.wxUserModel.getOneByOpenId(openId)

        if (user) {
            debug('从本地获取微信用户信息: %O', user)
            return user
        } else {
            debug('从本地获取微信用户信息: 失败')
        }

        // 如果没有，从微信开放平台读取

        return this.refreshUserInfo(accessToken, openId)

        // user = await this.wx.getUserInfo(accessToken, openId)
        // debug('从微信开放平台获取微信用户信息: %O', user)
        // user.wx_response = JSON.stringify(user)

        // // 缓存并返回

        // let rows = await this.wxUserModel.upsert(user)
        // if (rows > 0) {
        //     debug('从微信开放平台获取微信用户信息缓存到本地:成功')
        // } else {
        //     debug('从微信开放平台获取微信用户信息缓存到本地:失败')
        // }

        // return user
    }

    async refreshUserInfo(accessToken, openId) {

        let user

        user = await this.wx.getUserInfo(accessToken, openId)
        debug('从微信开放平台获取微信用户信息: %O', user)

        user.wx_response = JSON.stringify(user)

        let rows = await this.wxUserModel.upsert(user)
        if (rows > 0) {
            debug('从微信开放平台获取微信用户信息缓存到本地:成功')
        } else {
            debug('从微信开放平台获取微信用户信息缓存到本地:失败')
        }

        return user
    }

    async getJssdkToken(url) {
        return await this.wx.getJssdkToken(url)
    }

    async fetchAudio(mediaId, savePath, filename = false) {

        let buffer = await this.wx.fetchAudio(mediaId)

        // 把文件流保存到本地
        let writeFile = new Promise((reslove) => {
            // 默认md5名字
            if (!filename) {
                filename = (() => {
                    let now = moment().format('YYYYMMDDHHss.S')
                    let random = randomString(5)
                    return md5(now + random) + '.amr'
                })()
            }
            // 保存文件到本地
            fs.writeFile(`${savePath}/${filename}`, buffer, () => {
                reslove(filename)
            })
        })

        return writeFile
    }
}