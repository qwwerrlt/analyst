'use strict';

module.exports = {
	port : 8080,
	mssql: 'mssql://onehou:onehoudata!@101.132.32.213:1433/',
	logger: {
	    path: 'logs/analyst.log',
	    eLog: 'logs/analyst.eLog',
	    dataPath: 'logs/analyst.data.log',
	    level: 'INFO'
    },
    mysql: {
		host     : 'localhost',
		port     : 33306,
		user     : 'root',
		password : '8cf97731da26',
		database : 'news'
    },
    logging: {
	    accessLog: {
	      filename: `logs/access.log`,
	      frequency: 'daily',
	      date_format: 'YYYYMMDD',
	      verbose: true,
	    },
    	errorLog: `logs/error.log`,
    	format: ':remote-addr - :remote-user [:date[iso]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" :response-time ms',
    },
	pageInfo: {
	    perPage: 10
	},
	privateKey :
	'-----BEGIN RSA PRIVATE KEY-----\n' +
	'MIIEpQIBAAKCAQEA20ZnKbGGwCWTJZfVylDBWSpEu39Rg6LKBnnT57X4dutV7SpNHbFbZ4mwRouLMkiROa0O2Z2EWt' +
	'+8jyXOA9eLY+QQKAW+KZyyLEINTTUHijqwEaixegqXmhcb4QnJqGaJNqwth/T3FdoUvWE+3dufZN+L3GI+BGdEkSAH' +
	'bVkaTqSDd40t+EUyiAj4+thfISILBNNm2j40kS3nKzD02BHKGbvjDXXcuy2SeYZQvxTN1QvTVNwiR50EtPD5aHf/18' +
	'YOS7Mt4RbMvQWvG5lmF2Lgh0OXs6TXXrY4sr3aIpMPPOqQuXQgIbo7K4y4aKgbIDuGcsPy+wSi2qStf8L3l2FEDQID' +
	'AQABAoIBAQDVkuA+iuw90RtenWIducRpLbNekKb7uR5famAMq4BDi/rYksAj8LCfy0uHmrlMk8Pn0njJWxQkUxHct6' +
	'zOry3UcLmP0fAjpb0hQICmN8WNTJZbzNx4i0KYUnPUH+1r+dsiBlgeuWnEvfI/dy19eEHrRZV7ZbEUJuVxGSpCxmvK' +
	'NcNN5BMHPlrWqtCyv0jjUvTbeqh/1XcEhv1hocAEx6HykYf+MVVwaHCbYO0SozfOVjOuUypUgAjWLvp/tS4bmT6oT2' +
	'hCXLWOUja3PsuSvRYD8MvGDyHiEfl3LnoZ/TEGcZ8BRo04ZnUJHWj4ffMo0ZBu5mwpZ6kgdBN7pj0GJpZBAoGBAO6b' +
	'b8hW2Umjs/vd7I3OemBE9FiN6ByXm3d3ojDk/svXprKKd02v5h1rJLzxD1ibQXGNXHkAi5Un/ri5FDjcc6UQ1H2iX0' +
	'Rs1iJumYUgQ9d1SAdOxjLiPaOnwI8Ky/SayrHCxghaBSilGV1r3cmiYJ/ANw8Dru8p30AqCQgJZDZxAoGBAOtCNzqN' +
	'iT3wEGFXGuTa+7nBQcHqutErj/t3tX/5WRPA4C5RrzSGX3CUyzQDNweMoXSAhad9g0FhmArk3dgzFP5nrbTUcp//uH' +
	'+sCPN/4ipjmrp/GDFjmkrBp4AV1eP78bydR9HuFrivOit74NSZQXSskDT3WPbcgCBjHk2O8c1dAoGBANCAWynBWpaS' +
	'ylApGPDBoQZGuw420sFJabz3eW8oa85MX4pcnOvx7S9/1NaV/0b6RDGpyUijRVXNYTSh5h3Z5eQz1LsEDCOKx4PHCb' +
	'fe/elkvtBD8cW9FQfRKt7UHG1eZgj3nnzlzOQ7gPK1s1Ti43Q1Tud73H15JXC4SrQPINbBAoGAJKTLtXMWTW93HbJT' +
	'nhH945EWjP3i23HNm32p56UPGuSQBqbyg1vqwb5raE6X47Uj8OGT7+K87xIkfI3pgCN0waukguYUdJeARWKmgkcJE1' +
	'EwaJwjSI4bGknPrUO5bSlxHc/hv/E12M5yYROKkZLNfz7ht15PnSP7URAfSDVbtIECgYEAoV4AL+/wEy55mRB1XF1T' +
	'2qVqK/7KjRQYV52Yi+aNTKuaXLQRZN1lf6lNzdsC9zqVZWzQffnGakoDWYHgBINXKuZWSun0VodDlLzuukfSERiquO' +
	'LoluaKTBmo7alMXGjBDGiccEQWb2eC8HA45MiBjxiSBWB6v5gkOsY+86qAx1c=\n' +
	'-----END RSA PRIVATE KEY-----',
	publicKey : 
	'-----BEGIN PUBLIC KEY-----\n' + 
	'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAwOHC279piN6urKO95F4zwqzp1P8OIHjPQvlvn+Jqrp4Jjs' +
	'00OwqJEQPHYJMHNzqBkzMgsYPfdfqCjopaobAPWzz2PVH6Xig8Nj6SWnx9IIZZXq9EynQ3W5w1QkpK+/iaxM3/WOFD' +
	'e/RfRiIhhqsInY87OevRRSR9SqYaZvKUZv8Zyrtfp6uIX1Mh1dACKXgJhc2EULD2TJ+1kgieBOcwLVPjr6yfAL1gp9' +
	'rLZR6pSsv/eIQscCK0+Hvd+6siZBNU8vtbEKNKfoZM93ljaErnKcUWNWAN1Zp6pPOCBCQx3sOxu7Bk8L9SUtPGmnxC' +
	'xca4HgYwBFZrtvI1uVhTotF3zwIDAQAB\n' + 
	'-----END PUBLIC KEY-----',
	ErrCode : {
		500 : 'mongodb error',
		600 : 'invalid param : type',
		601 : 'access_token can not be null',
		602 : 'verify ali notify failed',
		603 : 'order do not exist',
		604 : 'user do not exist'
	},
	Leaguer : [0, 88, 888, 0.01],
	Body    : ['', '会员*1月', '会员*1年', '会员测试'],
	ali : {
		app_id : '2017021705719543'
	}
}
