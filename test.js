'use strict';

// var mysql      = require('mysql');
// var connection = mysql.createConnection({
//   host     : 'localhost',
//   port     : 33306,
//   user     : 'root',
//   password : '8cf97731da26',
//   database : 'news'
// });

// connection.connect();

// connection.query('SELECT * from analyst limit 1', function (error, results, fields) {
//   if (error) throw error;
//   console.log('The solution is: ', results, fields);
// });

// connection.end();

const mssql = require('mssql');
mssql.connect('mssql://onehou:onehoudata!@101.132.32.213:1433/', err => {
	console.log(err)
	//select name from sys.objects where type='U'
	new mssql.Request().query("select top 1 * from report..QMXStockPool where ID > 3 and InstituteFullName is not null and PriceRC is not null and PriceRC != 0", (err, result) => {
        // ... error checks 
 
        console.log(err,result.recordset.length)
    })
});

mssql.on('error', function(err) {
  console.log(err);

});
 