CREATE DATABASE  IF NOT EXISTS `intelligentwebassignment` /*!40100 DEFAULT CHARACTER SET utf8 */;
USE `intelligentwebassignment`;
-- MySQL dump 10.13  Distrib 5.7.11, for Win64 (x86_64)
--
-- Host: localhost    Database: intelligentwebassignment
-- ------------------------------------------------------
-- Server version	5.7.11-log

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `footballclubs`
--

DROP TABLE IF EXISTS `footballclubs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `footballclubs` (
  `footballClubId` int(11) NOT NULL AUTO_INCREMENT,
  `footballClubName` varchar(45) NOT NULL,
  `footballClubTwitterHandle` varchar(45) NOT NULL,
  `footballClubDBPediaPage` varchar(2038) DEFAULT NULL,
  PRIMARY KEY (`footballClubId`),
  UNIQUE KEY `footballclubId_UNIQUE` (`footballClubId`),
  UNIQUE KEY `footballClubTwitterHandle_UNIQUE` (`footballClubTwitterHandle`)
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `footballclubs`
--

LOCK TABLES `footballclubs` WRITE;
/*!40000 ALTER TABLE `footballclubs` DISABLE KEYS */;
INSERT INTO `footballclubs` VALUES (1,'Manchester United','ManUtd','http://dbpedia.org/resource/Manchester_United_F.C.'),(2,'Arsenal','Arsenal','http://dbpedia.org/resource/Arsenal_F.C.'),(3,'Chelsea','ChelseaFC','http://dbpedia.org/resource/Chelsea_F.C.'),(4,'Liverpool','LFC','http://dbpedia.org/resource/Liverpool_F.C.'),(5,'Manchester City','MCFC','http://dbpedia.org/resource/Manchester_City_F.C.'),(6,'Tottenham Hotspur','SpursOfficial','http://dbpedia.org/resource/Tottenham_Hotspur_F.C.'),(7,'Everton','Everton','http://dbpedia.org/resource/Everton_F.C.'),(8,'Newcastle United','NUFC','http://dbpedia.org/resource/Newcastle_United_F.C.'),(9,'West Ham United','whufc_official','http://dbpedia.org/resource/West_Ham_United_F.C.'),(10,'Aston Villa','AVFCOfficial','http://dbpedia.org/resource/Aston_Villa_F.C.'),(11,'Southampton','SouthamptonFC','http://dbpedia.org/resource/Southampton_F.C.'),(12,'Swansea City','SwansOfficial','http://dbpedia.org/resource/Swansea_City_A.F.C.'),(13,'Sunderland','SunderlandAFC','http://dbpedia.org/resource/Sunderland_A.F.C.'),(14,'Stoke City','stokecity','http://dbpedia.org/resource/Stoke_City_F.C.'),(15,'West Bromwich Albion','WBAFCofficial','http://dbpedia.org/resource/West_Bromwich_Albion_F.C.'),(16,'Leicester City','LCFC','http://dbpedia.org/resource/Leicester_City_F.C.'),(17,'Norwich City','NorwichCityFC','http://dbpedia.org/resource/Norwich_City_F.C.'),(18,'Crystal Palace','CPFC','http://dbpedia.org/resource/Crystal_Palace_F.C.'),(19,'QPR','QPRFC','http://dbpedia.org/resource/Queens_Park_Rangers_F.C.'),(20,'Fulham','FulhamFC','http://dbpedia.org/resource/Fulham_F.C.'),(21,'Hull City','HullCity','http://dbpedia.org/resource/Hull_City_A.F.C.'),(22,'Wigan Athletic','LaticsOfficial','http://dbpedia.org/resource/Wigan_Athletic_F.C.'),(23,'Reading','ReadingFC','http://dbpedia.org/resource/Reading_F.C.'),(24,'Leeds United','LUFC','http://dbpedia.org/resource/Leeds_United_F.C.'),(25,'Cardiff City','CardiffCityFC','http://dbpedia.org/resource/Cardiff_City_F.C.'),(26,'Watford ','WatfordFC','http://dbpedia.org/resource/Watford_F.C.'),(27,'AFC Bournemouth','afcbournemouth','http://dbpedia.org/resource/A.F.C._Bournemouth');
/*!40000 ALTER TABLE `footballclubs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `footballplayers`
--

DROP TABLE IF EXISTS `footballplayers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `footballplayers` (
  `footballPlayerId` int(11) NOT NULL AUTO_INCREMENT,
  `footballPlayerName` varchar(45) NOT NULL,
  `footballPlayerTwitterHandle` varchar(45) NOT NULL,
  `footballPlayerFootballClubId` int(11) NOT NULL,
  `footballPlayerDBPediaPage` varchar(2038) DEFAULT NULL,
  PRIMARY KEY (`footballPlayerId`),
  UNIQUE KEY `footballplayerId_UNIQUE` (`footballPlayerId`),
  UNIQUE KEY `footballPlayerTwitterHandle_UNIQUE` (`footballPlayerTwitterHandle`),
  KEY `footballPlayerFootballClubId_idx` (`footballPlayerFootballClubId`),
  CONSTRAINT `footballPlayerFootballClubId` FOREIGN KEY (`footballPlayerFootballClubId`) REFERENCES `footballclubs` (`footballClubId`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `footballplayers`
--

LOCK TABLES `footballplayers` WRITE;
/*!40000 ALTER TABLE `footballplayers` DISABLE KEYS */;
INSERT INTO `footballplayers` VALUES (2,'Wayne Rooney','WayneRooney',1,NULL),(3,'David De Gea','D_DeGea',1,NULL),(4,'Juan Mata','juanmata8',1,NULL),(5,'Bastian Schweinsteiger','BSchweinsteiger',1,NULL),(6,'Marcos Rojo','marcosrojo5',1,NULL),(7,'Phil Jones','PhilJones4',1,NULL),(8,'Michael Carrick','carras16',1,NULL),(9,'Marouane Fellaini','Fellaini',1,NULL),(10,'Ander Herrera','AnderHerrera',1,NULL),(11,'Luke Shaw','LukeShaw23',1,NULL),(12,'Ashley Young','youngy18',1,NULL),(13,'Daley Blind','BlindDaley',1,NULL),(14,'Morgan Schneiderlin','SchneiderlinMo4',1,NULL),(15,'Anthony Martial','AnthonyMartial',1,NULL),(16,'Chris Smalling','ChrisSmalling',1,NULL),(17,'Matteo Darmian','DarmianOfficial',1,NULL),(18,'Andreas Pereira','andrinhopereira',1,NULL),(19,'Antonio Valencia','anto_v25',1,NULL),(20,'Sam Johnstone','samjohnstone50',1,NULL),(21,'Sergio Romero','Chiquito1Romero',1,NULL);
/*!40000 ALTER TABLE `footballplayers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tweets`
--

DROP TABLE IF EXISTS `tweets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tweets` (
  `tweetId` int(11) NOT NULL AUTO_INCREMENT,
  `twitterUserId` int(11) NOT NULL,
  `tweetCreatedAt` date NOT NULL,
  `tweetText` varchar(280) CHARACTER SET utf8mb4 NOT NULL,
  `tweetDateAdded` date NOT NULL,
  UNIQUE KEY `idtweets_UNIQUE` (`tweetId`),
  KEY `twitterUserId_idx` (`twitterUserId`),
  CONSTRAINT `tweetsTwitterUserId` FOREIGN KEY (`twitterUserId`) REFERENCES `twitterusers` (`twitterUserId`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=2530 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tweets`
--

LOCK TABLES `tweets` WRITE;
/*!40000 ALTER TABLE `tweets` DISABLE KEYS */;
/*!40000 ALTER TABLE `tweets` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tweettwitterhashtags`
--

DROP TABLE IF EXISTS `tweettwitterhashtags`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tweettwitterhashtags` (
  `tweetTwitterHashtagId` int(11) NOT NULL AUTO_INCREMENT,
  `tweetTwitterHashtagTweetId` int(11) NOT NULL,
  `tweetTwitterHashtagTwitterHashtagId` int(11) NOT NULL,
  `tweetTwitterHashtagStartPoint` int(11) NOT NULL,
  `tweetTwitterHashtagEndPoint` int(11) NOT NULL,
  PRIMARY KEY (`tweetTwitterHashtagId`),
  UNIQUE KEY `tweetTwitterHashtagId_UNIQUE` (`tweetTwitterHashtagId`),
  KEY `tweetTwitterHashtagTweetId_idx` (`tweetTwitterHashtagTweetId`),
  KEY `tweetTwitterHashtagTwitterHashtagId_idx` (`tweetTwitterHashtagTwitterHashtagId`),
  CONSTRAINT `tweetTwitterHashtagTweetId` FOREIGN KEY (`tweetTwitterHashtagTweetId`) REFERENCES `tweets` (`tweetId`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `tweetTwitterHashtagTwitterHashtagId` FOREIGN KEY (`tweetTwitterHashtagTwitterHashtagId`) REFERENCES `twitterhashtags` (`twitterHashtagId`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=2357 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tweettwitterhashtags`
--

LOCK TABLES `tweettwitterhashtags` WRITE;
/*!40000 ALTER TABLE `tweettwitterhashtags` DISABLE KEYS */;
/*!40000 ALTER TABLE `tweettwitterhashtags` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tweettwittermedias`
--

DROP TABLE IF EXISTS `tweettwittermedias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tweettwittermedias` (
  `tweetsTwitterMediaId` int(11) NOT NULL AUTO_INCREMENT,
  `tweetTwitterMediaTweetId` int(11) NOT NULL,
  `tweetTwitterMediaTwitterMediaId` int(11) NOT NULL,
  `tweetTwitterMediaStartPoint` int(11) NOT NULL,
  `tweetTwitterMediaEndPoint` int(11) NOT NULL,
  PRIMARY KEY (`tweetsTwitterMediaId`),
  UNIQUE KEY `tweetsTwitterMediaId_UNIQUE` (`tweetsTwitterMediaId`)
) ENGINE=InnoDB AUTO_INCREMENT=161 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tweettwittermedias`
--

LOCK TABLES `tweettwittermedias` WRITE;
/*!40000 ALTER TABLE `tweettwittermedias` DISABLE KEYS */;
/*!40000 ALTER TABLE `tweettwittermedias` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tweettwitterurls`
--

DROP TABLE IF EXISTS `tweettwitterurls`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tweettwitterurls` (
  `tweetTwitterUrlId` int(11) NOT NULL AUTO_INCREMENT,
  `tweetTwitterUrlTweetId` int(11) NOT NULL,
  `tweetTwitterUrlTwitterUrlId` int(11) NOT NULL,
  `tweetTwitterUrlStartPoint` int(11) NOT NULL,
  `tweetTwitterUrlEndPoint` int(11) NOT NULL,
  PRIMARY KEY (`tweetTwitterUrlId`),
  UNIQUE KEY `tweetTwitterUrlId_UNIQUE` (`tweetTwitterUrlId`),
  KEY `tweetTwitterUrlTweetId_idx` (`tweetTwitterUrlTweetId`),
  KEY `tweetTwitterUrlTwitterUrlId_idx` (`tweetTwitterUrlTwitterUrlId`),
  CONSTRAINT `tweetTwitterUrlTweetId` FOREIGN KEY (`tweetTwitterUrlTweetId`) REFERENCES `tweets` (`tweetId`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `tweetTwitterUrlTwitterUrlId` FOREIGN KEY (`tweetTwitterUrlTwitterUrlId`) REFERENCES `twitterurls` (`twitterUrlId`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=162 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tweettwitterurls`
--

LOCK TABLES `tweettwitterurls` WRITE;
/*!40000 ALTER TABLE `tweettwitterurls` DISABLE KEYS */;
/*!40000 ALTER TABLE `tweettwitterurls` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tweetusers`
--

DROP TABLE IF EXISTS `tweetusers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tweetusers` (
  `tweetUserId` int(11) NOT NULL AUTO_INCREMENT,
  `tweetId` int(11) NOT NULL,
  `twitterUserId` int(11) NOT NULL,
  `tweetStartPoint` int(11) NOT NULL,
  `tweetEndPoint` int(11) NOT NULL,
  PRIMARY KEY (`tweetUserId`),
  UNIQUE KEY `tweetUserId_UNIQUE` (`tweetUserId`),
  KEY `tweetId_idx` (`tweetId`),
  KEY `twitterUserId_idx` (`twitterUserId`),
  CONSTRAINT `tweetUserTweetId` FOREIGN KEY (`tweetId`) REFERENCES `tweets` (`tweetId`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=1318 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tweetusers`
--

LOCK TABLES `tweetusers` WRITE;
/*!40000 ALTER TABLE `tweetusers` DISABLE KEYS */;
/*!40000 ALTER TABLE `tweetusers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `twitterhashtags`
--

DROP TABLE IF EXISTS `twitterhashtags`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `twitterhashtags` (
  `twitterHashtagId` int(11) NOT NULL AUTO_INCREMENT,
  `twitterHashtagText` varchar(45) NOT NULL,
  PRIMARY KEY (`twitterHashtagId`),
  UNIQUE KEY `twitterHashtagId_UNIQUE` (`twitterHashtagId`)
) ENGINE=InnoDB AUTO_INCREMENT=1185 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `twitterhashtags`
--

LOCK TABLES `twitterhashtags` WRITE;
/*!40000 ALTER TABLE `twitterhashtags` DISABLE KEYS */;
/*!40000 ALTER TABLE `twitterhashtags` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `twittermedias`
--

DROP TABLE IF EXISTS `twittermedias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `twittermedias` (
  `twitterMediaId` int(11) NOT NULL AUTO_INCREMENT,
  `twitterMediaUrl` varchar(2083) NOT NULL,
  `twitterMediaMediaId` varchar(45) NOT NULL,
  `twitterMediaType` varchar(45) NOT NULL,
  PRIMARY KEY (`twitterMediaId`),
  UNIQUE KEY `twitterMediaId_UNIQUE` (`twitterMediaId`)
) ENGINE=InnoDB AUTO_INCREMENT=117 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `twittermedias`
--

LOCK TABLES `twittermedias` WRITE;
/*!40000 ALTER TABLE `twittermedias` DISABLE KEYS */;
/*!40000 ALTER TABLE `twittermedias` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `twitterurls`
--

DROP TABLE IF EXISTS `twitterurls`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `twitterurls` (
  `twitterUrlId` int(11) NOT NULL AUTO_INCREMENT,
  `twitterUrlUrl` varchar(2083) NOT NULL,
  `twitterUrlExpandedUrl` varchar(2083) NOT NULL,
  `twitterUrlDisplayUrl` varchar(2083) NOT NULL,
  PRIMARY KEY (`twitterUrlId`),
  UNIQUE KEY `twitterUrlId_UNIQUE` (`twitterUrlId`)
) ENGINE=InnoDB AUTO_INCREMENT=156 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `twitterurls`
--

LOCK TABLES `twitterurls` WRITE;
/*!40000 ALTER TABLE `twitterurls` DISABLE KEYS */;
/*!40000 ALTER TABLE `twitterurls` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `twitterusers`
--

DROP TABLE IF EXISTS `twitterusers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `twitterusers` (
  `twitterUserId` int(11) NOT NULL AUTO_INCREMENT,
  `twitterUserName` varchar(45) NOT NULL,
  `twitterUserScreenName` varchar(45) NOT NULL,
  `twitterUserTwitterId` bigint(11) NOT NULL,
  PRIMARY KEY (`twitterUserId`),
  UNIQUE KEY `twitterUsersId_UNIQUE` (`twitterUserId`)
) ENGINE=InnoDB AUTO_INCREMENT=6042 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `twitterusers`
--

LOCK TABLES `twitterusers` WRITE;
/*!40000 ALTER TABLE `twitterusers` DISABLE KEYS */;
/*!40000 ALTER TABLE `twitterusers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping events for database 'intelligentwebassignment'
--

--
-- Dumping routines for database 'intelligentwebassignment'
--
/*!50003 DROP PROCEDURE IF EXISTS `delete_all` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `delete_all`()
BEGIN
	DELETE FROM tweettwitterhashtags;
    DELETE FROM twitterhashtags;
    
    DELETE FROM tweettwitterurls;
    DELETE FROM twitterurls;
    
    DELETE FROM twittermedias;
    DELETE FROM tweettwittermedias;
    
    DELETE FROM tweetusers;
    DELETE FROM tweets;
    DELETE FROM twitterusers;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `get_football_clubs` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `get_football_clubs`()
BEGIN
	SELECT * FROM footballclubs;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `get_football_players` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `get_football_players`()
BEGIN
	SELECT * FROM footballplayers;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2016-05-13 17:22:39
