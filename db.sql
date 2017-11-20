
--
-- Table structure for table `dt_wx_access_token`
--

DROP TABLE IF EXISTS `dt_wx_access_token`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `dt_wx_access_token` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `access_token` varchar(500) NOT NULL,
  `expires_in` int(10) unsigned NOT NULL,
  `create_time` int(10) unsigned NOT NULL,
  `update_time` int(10) unsigned NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `access_token_UNIQUE` (`access_token`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='服务端调用微信用的access_token';


--
-- Table structure for table `dt_wx_ticket`
--

DROP TABLE IF EXISTS `dt_wx_ticket`;
CREATE TABLE `dt_wx_ticket` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `ticket` varchar(500) NOT NULL,
  `expires_in` int(11) unsigned NOT NULL,
  `errcode` int(11) NOT NULL,
  `errmsg` varchar(100) NOT NULL,
  `create_time` int(10) unsigned NOT NULL,
  `update_time` int(10) unsigned NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='微信jssdk需要的ticket';

--
-- Table structure for table `dt_wx_user`
--

DROP TABLE IF EXISTS `dt_wx_user`;
CREATE TABLE `dt_wx_user` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `open_id` varchar(100) NOT NULL,
  `nickname` varchar(45) NOT NULL,
  `headimgurl` varchar(500) NOT NULL,
  `access_token` varchar(1000) NOT NULL COMMENT '获取用户信息用的access_token（oauth）',
  `wx_response` varchar(2000) NOT NULL,
  `create_time` int(11) NOT NULL,
  `update_time` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `open_id` (`open_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='微信用户数据';

