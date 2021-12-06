const testDataController = async (req, res, db) => {
    if (req.method === 'DELETE') {
        await db.Rating.destroy({
            where: {isTest: true},
        });
        
        await db.Token.destroy({
            where: { isTest: true },
        });
        await db.CarModel.destroy({
            where: { isTest: true },
        });
        await db.RatingHeader.destroy({
            where: { isTest: true },
        })

        res.sendStatus(200);
    } else {
        res.sendStatus(405);
    }
}

module.exports = testDataController;