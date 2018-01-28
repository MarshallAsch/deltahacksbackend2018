var express = require("express");
var router = express.Router();
var mysql = require("mysql");



/**
 * This endpoint will get a list of all of the objects in the database
 *
 * @param   req  the http request object that is being handled
 * @param   res  the responce object that will eventually be sent back the client
 * @param   next callback that will cause the next middlewhere function to be executed.
 * @return       none
 */
router.get("/", validate, function(req, res, next) {

    res.setHeader('Content-Type', 'application/json');

    var limit = parseInt(req.query.limit, 10) || 20;
    var offset = parseInt(req.query.offset, 10) || 0;

    if (limit > 50) {
        limit = 50;
    }
    else if (limit < 1) {
        limit = 1;
    }

    if (offset < 0) {
        offset = 0;
    }

    res.locals.connection.query("SELECT ID,name,description from objects limit ?, ?", [offset, limit], function (error, results, fields) {
        if (error) {
            var err = new Error(error.sqlMessage);
            err.status = 500;
            err.code = error.error;
            err.error = error;
            next(err);
            return;
        }

        var objects = results;

        res.locals.connection.query("SELECT count(*) AS total from objects", function (error, results, fields) {
            if (error) {
                var err = new Error(error.sqlMessage);
                err.status = 500;
                err.code = error.error;
                err.error = error;
                next(err);
            }
            else {
                res.status(200);
                res.send({"status": 200, "error": null, "response": {"objects": objects, "limit": limit, "offset": offset, "total": results[0].total}});
            }
        });
    });

});

/**
 * This endpoint will create a new object
 *
 *
 * @param   req  the http request object that is being handled
 * @param   res  the responce object that will eventually be sent back the client
 * @param   next callback that will cause the next middlewhere function to be executed.
 * @return       none
 */
router.post("/", function(req, res, next) {

    res.setHeader('Content-Type', 'application/json');


    var invalidFields = {};

    if (req.body.ID === undefined || req.body.ID.length >= 37) {
        invalidFields.ID = "ID is invalid \"" + req.body.ID + "\"";
    }

    if (req.body.name === undefined || req.body.name.length >= 100) {
        invalidFields.name = "name is invalid \"" + req.body.name + "\"";
    }

    if (req.body.description === undefined || req.body.description.length >= 100) {
        invalidFields.description = "description is invalid \"" + req.body.description + "\"";
    }


    //make sure that at least 1 field is being updated
    if (Object.keys(invalidFields).length !== 0)
    {
        var err = new Error("Invalid fields given");
        err.status = 400;
        err.code = "bad-req";
        err.error = invalidFields;
        next(err);
        return;
    }

    // load the sent data into the struct to put into the database
    var data =
    {
        ID:             req.body.first_ID,
        name:           req.body.name,
        description:    req.body.description
    };

    // add the user to the database
    res.locals.connection.query("INSERT into objects set ?", data, function (error, results, fields) {
        if (error) {
            var err = new Error(error.sqlMessage);
            err.status = 500;
            err.code = error.error;
            err.error = error;
            next(err);
        } else {
            res.status(201);
            res.send({"status": 201, "error": null, "response": results});
        }
    });

});

/**
 * This endpoint will update the data in one of the objects
 *
 * This requires the user to be authenticated.
 *
 * @param   req  the http request object that is being handled
 * @param   res  the responce object that will eventually be sent back the client
 * @param   next callback that will cause the next middlewhere function to be executed.
 * @return       none
 */
router.patch("/:ID", validate, function(req, res, next) {

    res.setHeader('Content-Type', 'application/json');

    var uid = req.param.ID;

    var invalidFields = {};
    var sqlData = {};

    if (req.body.name === undefined || req.body.name.length >= 100) {
        invalidFields.name = "name is invalid \"" + req.body.name + "\"";
    }
    else {
        sqlData.name = name;
    }

    if (req.body.description === undefined || req.body.description.length >= 100) {
        invalidFields.description = "description is invalid \"" + req.body.description + "\"";
    }
    else {
        sqlData.description = description;
    }


    //make sure that at least 1 field is being updated
    if (Object.keys(invalidFields).length !== 0)
    {
        var err = new Error("Invalid fields given");
        err.status = 400;
        err.code = "bad-req";
        err.error = invalidFields;
        next(err);
        return;
    }

    //make sure that at least 1 field is being updated
    if (Object.keys(sqlData).length === 0)
    {
        var err = new Error("No values are given to update.");
        err.status = 400;
        err.code = "bad-req";
        err.error = req.body;
        next(err);
        return;
    }

    res.locals.connection.query("UPDATE objects set ? where ID = ?",[sqlData, uid], function (error, results, fields) {
        if (error) {
            var err = new Error(error.sqlMessage);
            err.status = 500;
            err.code = error.error;
            err.error = error;
            next(err);
        } else {
            res.status(200);
            res.send(JSON.stringify({"status": 200, "error": null, "response": results}));
        }
    });
});

/**
 * This will get a specific objects data
 *
 * @param   req  the http request object that is being handled
 * @param   res  the responce object that will eventually be sent back the client
 * @param   next callback that will cause the next middlewhere function to be executed.
 * @return       none
 */
router.get("/:ID", validate, function(req, res, next) {

    res.setHeader('Content-Type', 'application/json');

    var uid = req.params.ID;


    res.locals.connection.query("SELECT ID,name,description from objects where ID = ? ",uid, function (error, results, fields) {
        if (error) {
            var err = new Error(error.sqlMessage);
            err.status = 500;
            err.code = error.error;
            err.error = error;
            next(err);
        }else {
            res.status(200);
            res.send(JSON.stringify({"status": 200, "error": null, "response": results[0] || {}}));
        }
    });

});

/**
 * This will remove a specific object from the database
 *
 * @param   req  the http request object that is being handled
 * @param   res  the responce object that will eventually be sent back the client
 * @param   next callback that will cause the next middlewhere function to be executed.
 * @return       none
 */
router.delete("/:ID", validate, function(req, res, next) {

    res.setHeader('Content-Type', 'application/json');

    var uid = req.params.ID


    res.locals.connection.query("delete from object where ID = ?", uid, function (error, results, fields) {
        if (error) {
            var err = new Error(error.sqlMessage);
            err.status = 500;
            err.code = error.error;
            err.error = error;
            next(err);
        } else {

            console.log("Successfully deleted object");
            res.status(200);
            res.send(JSON.stringify({"status": 200, "error": null, "response": results}));
        }
    });
});


module.exports = router;
