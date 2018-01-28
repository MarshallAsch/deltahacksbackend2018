

# Create the user to access the database for node
CREATE USER IF NOT EXISTS '{{USERNAME}}'@'localhost' IDENTIFIED BY '{{PASSWORD}}';

CREATE DATABASE IF NOT EXISTS `{{DATABASE}}` CHARACTER SET = utf8 COLLATE = utf8_general_ci;

# do not add additional privileges since this is all the access that the node.js API needs.
GRANT DELETE, INSERT, SELECT, UPDATE ON `{{DATABASE}}`.* TO '{{USERNAME}}'@'localhost';

USE `{{DATABASE}}`;

# The rest of the commands are to create the tables they does not yet exist

CREATE TABLE IF NOT EXISTS `objects` (
	`ID` varchar(37) NOT NULL UNIQUE,
	`name` varchar(100) NOT NULL,
	`description` varchar(100) NOT NULL,
	PRIMARY KEY (`ID`)
) ENGINE=INNODB;
