var logger = require('../libs/log');




describe('Logger test', function () {

    it.skip('should correctly print deeply nested json objects', function () {

        var tst = {
            log: logger.createLogger('Test logger', { keysColor: 'cyan' })
        };

        var data = {
           "Categories":{
              "Facets":[
                 {
                    "count":1,
                    "entity":"Company",
                    "Company":[
                       {
                          "entity":"Ford Motor Co",
                          "Ford_Motor_Co":[
                             {
                                "count":1,
                                "entity":"Ford"
                             }
                          ]
                       }
                    ]
                 },
                 {
                    "count":4,
                    "entity":"Country",
                    "Country":[
                       {
                          "entity":"Germany",
                          "Germany":[
                             {
                                "count":1,
                                "entity":"Germany"
                             }
                          ],
                          "currency":"Euro (EUR)"
                       },
                       {
                          "entity":"Italy",
                          "Italy":[
                             {
                                "count":1,
                                "entity":"Italy"
                             }
                          ],
                          "currency":"Euro (EUR)"
                       },
                       {
                          "entity":"Japan",
                          "Japan":[
                             {
                                "count":1,
                                "entity":"Japan"
                             }
                          ],
                          "currency":"Yen (JPY)"
                       },
                       {
                          "entity":"South Korea",
                          "South_Korea":[
                             {
                                "count":1,
                                "entity":"South Korea"
                             }
                          ],
                          "currency":"Won (KRW)"
                       }
                    ]
                 },
                 {
                    "count":5,
                    "entity":"Persons",
                    "Persons":[
                       {
                          "count":2,
                          "entity":"Dodge"
                       },
                       {
                          "count":1,
                          "entity":"Dodge Avenger"
                       },
                       {
                          "count":1,
                          "entity":"Major League"
                       },
                       {
                          "count":1,
                          "entity":"Sterling Heights"
                       }
                    ]
                 }
              ]
           }
        }

        tst.log('Log event', data);


    });

});