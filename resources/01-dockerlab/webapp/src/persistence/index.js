import { env } from 'node:process'
import * as mysql from './mysql.js';
import * as sqlite from './sqlite.js';

const database = env['MYSQL_URL'] ? mysql : sqlite;
export default database;
