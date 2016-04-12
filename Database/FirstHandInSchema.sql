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
  PRIMARY KEY (`footballClubId`),
  UNIQUE KEY `footballclubId_UNIQUE` (`footballClubId`),
  UNIQUE KEY `footballClubTwitterHandle_UNIQUE` (`footballClubTwitterHandle`)
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

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
  PRIMARY KEY (`footballPlayerId`),
  UNIQUE KEY `footballplayerId_UNIQUE` (`footballPlayerId`),
  UNIQUE KEY `footballPlayerTwitterHandle_UNIQUE` (`footballPlayerTwitterHandle`),
  KEY `footballPlayerFootballClubId_idx` (`footballPlayerFootballClubId`),
  CONSTRAINT `footballPlayerFootballClubId` FOREIGN KEY (`footballPlayerFootballClubId`) REFERENCES `footballclubs` (`footballClubId`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

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
) ENGINE=InnoDB AUTO_INCREMENT=603 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

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
) ENGINE=InnoDB AUTO_INCREMENT=1394 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

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
) ENGINE=InnoDB AUTO_INCREMENT=714 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

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
) ENGINE=InnoDB AUTO_INCREMENT=611 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `twitterurls`
--

DROP TABLE IF EXISTS `twitterurls`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `twitterurls` (
  `twitterUrlId` int(11) NOT NULL AUTO_INCREMENT,
  `twitterUrlUrl` varchar(45) NOT NULL,
  `twitterUrlExpandedUrl` varchar(45) NOT NULL,
  `twitterUrlDisplayUrl` varchar(45) NOT NULL,
  PRIMARY KEY (`twitterUrlId`),
  UNIQUE KEY `twitterUrlId_UNIQUE` (`twitterUrlId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

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
) ENGINE=InnoDB AUTO_INCREMENT=883 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2016-04-12 20:56:00
