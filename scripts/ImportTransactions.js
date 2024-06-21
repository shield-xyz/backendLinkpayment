const { connectDB } = require("../db");

const runScript = async () => {
    await connectDB();

    
    try {

    } catch (error) {
        console.log(error, "error script importTransaction");
    }
};

runScript();