import * as mysql from './mysql.js';
import * as sqlite from './sqlite.js';

const database = process.env.MYSQL_URL ? mysql : sqlite;
export default database;
