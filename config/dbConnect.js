const mongoose = require('mongoose');

async function connect_DB() {
    try {
        await mongoose.connect(process.env.DATABASE_URI);

    }
    catch (err) {
        console.error(err);
        process.exit(1);
    }
}

module.exports = connect_DB;