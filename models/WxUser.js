import spModel from 'sp-model'
const moment = require('moment')

export default class WxUser extends spModel {

    _table = 'dt_wx_user'

    async getOneByOpenid(openId, cols = '*') {

        let sql = `SELECT ${cols} FROM ${this.table} WHERE open_id = ${openId}`

        let [result] = await this.mysql.query(sql)

        return this.returnOne(result)
    }

    async upsert(user) {

        let update_time = moment().format('X')
        let create_time = update_time

        let sql = `
            INSERT INTO ${this.table} 
            (
                open_id, 
                nickname, 
                headimgurl, 
                access_token, 
                wx_response, 
                create_time, 
                update_time
            ) 
            VALUES 
            (
                '${user.open_id}', 
                '${user.nickname}', 
                '${user.headimgurl}', 
                '${user.access_token}', 
                '${user.wx_response}', 
                '${create_time}', 
                '${update_time}'
            ) 
            ON DUPLICATE KEY UPDATE 
                nickname = '${user.nickname}', 
                headimage = '${user.headimgurl}', 
                access_token = '${user.access_token}', 
                wx_response = '${user.wx_response}',  
                update_time = '${update_time}'
        `

        let [result] = await this.mysql.query(sql, user)

        return result.affectedRows
    }
}