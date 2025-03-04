import path from 'path';
import * as dotenv from 'dotenv';
import { TTTappServer } from './server/server';


dotenv.config({ path: path.join(__dirname, "database/db.env") });

function startServer(): void {    
    const s = TTTappServer.getInstance(); //start server

}

if (require.main == module) {
    startServer()
}