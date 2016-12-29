import test from 'ava';
import DeepObjectGraph from './dist/DeepObjectGraph';

let dogInstance = new DeepObjectGraph({
    specialKeyArray: ['tags']
});

test('Convert delimited key to JSON. 1 level nest.', async t => {
    const data = [{
        "id": "1",
        "name": "Cat",
        "tags.id": "t2",
        "tags.tag": "animal",
        "tags.description": null,
        "tags.metadata": {
            "isStray": true
        }
    }];

    const expectedData = [{
        "id": "1",
        "name": "Cat",
        "tags": [{
            "id": "t2",
            "tag": "animal",
            "description": null,
            "metadata": {
                "isStray": true
            }
        }]
    }]

    const formattedData = dogInstance.convert(data);
    t.deepEqual(formattedData, expectedData);
});


test('Convert delimited key to JSON. 1 level nest. With custom primaryKeyField', async t => {
    let thisDogInstance = new DeepObjectGraph({
        primaryKeyField: 'uuid'
    });

    const data = [{
        "uuid": "1",
        "name": "Cat",
        "tags.uuid": "t2",
        "tags.tag": "animal",
        "tags.description": null,
        "tags.metadata": {
            "isStray": true
        }
    }];

    const expectedData = [{
        "uuid": "1",
        "name": "Cat",
        "tags": {
            "uuid": "t2",
            "tag": "animal",
            "description": null,
            "metadata": {
                "isStray": true
            }
        }
    }]

    const formattedData = thisDogInstance.convert(data);
    t.deepEqual(formattedData, expectedData);
});

test('Convert delimited key to JSON. 1 level nest. Without special key', async t => {
    let thisDogInstance = new DeepObjectGraph();
    
    const data = [{
        "id": "1",
        "name": "Cat",
        "tags.id": "t2",
        "tags.tag": "animal",
        "tags.description": null,
        "tags.metadata": {
            "isStray": true
        }
    }];

    const expectedData = [{
        "id": "1",
        "name": "Cat",
        "tags": {
            "id": "t2",
            "tag": "animal",
            "description": null,
            "metadata": {
                "isStray": true
            }
        }
    }]

    const formattedData = thisDogInstance.convert(data);
    t.deepEqual(formattedData, expectedData);
});

test('Get instance options', async t => {
    t.deepEqual(dogInstance.getOptions(), {
        primaryKeyField: 'id',
        delimiter: '.',
        specialKeyArray: ['tags']
    });
});

test('Set and Get instance options', async t => {
    let thisDogInstance = new DeepObjectGraph({
        delimiter: ':',
        specialKeyArray: ['cats', 'dogs'],
        invalidField123: true
    });

    thisDogInstance.setOptions({
        delimiter: '::'
    });
    
    t.deepEqual(thisDogInstance.getOptions(), {
        primaryKeyField: 'id',
        delimiter: '::',
        specialKeyArray: ['cats', 'dogs']
    });
});

test('Check custom Instance options', async t => {
    let thisDogInstance = new DeepObjectGraph({
        delimiter: ':',
        specialKeyArray: ['cats', 'dogs']
    });

    t.deepEqual(thisDogInstance.getOptions(), {
        primaryKeyField: 'id',
        delimiter: ':',
        specialKeyArray: ['cats', 'dogs']
    });
});

test('Convert delimited key to JSON. 2 level nest.', async t => {
    const data = [{
        "id": "1",
        "name": "Cat",
        "tags.id": "t2",
        "tags.tag": "animal",
        "tags.description": null,
        "tags.meta.isHungry": true,
        "tags.meta.isCute": false
    }];

    const expectedData = [{
        "id": "1",
        "name": "Cat",
        "tags": [{
            "id": "t2",
            "tag": "animal",
            "description": null,
            "meta": {
                "isHungry": true,
                "isCute": false
            }
        }]
    }]

    const formattedData = dogInstance.convert(data); 
    t.deepEqual(formattedData, expectedData);
});

test('Convert delimited key to JSON. 3 level nest.', async t => {
    const data = [{
        "id": "1",
        "name": "Cat",
        "tags.id": "t2",
        "tags.tag": "animal",
        "tags.description": null,
        "tags.meta.isHungry": true,
        "tags.meta.isCute": false,
        "tags.meta.isNotStray.hasName": true
    }];

    const expectedData = [{
        "id": "1",
        "name": "Cat",
        "tags": [{
            "id": "t2",
            "tag": "animal",
            "description": null,
            "meta": {
                "isHungry": true,
                "isCute": false,
                "isNotStray": {
                    "hasName": true
                }
            }
        }]
    }]

    const formattedData = dogInstance.convert(data);
    t.deepEqual(formattedData, expectedData);
});

test('Convert multiple. 3 level nest.', async t => {
    const data = [{
        "id": "1",
        "name": "Cat",
        "tags.id": "t2",
        "tags.tag": "animal",
        "tags.description": null,
        "tags.meta.isHungry": true,
        "tags.meta.isCute": false,
        "tags.meta.isNotStray.hasName": true
    },{
        "id": "1",
        "name": "Cat",
        "tags.id": "t2",
        "tags.tag": "animal",
        "tags.description": null,
        "tags.meta.isHungry": true,
        "tags.meta.isCute": false,
        "tags.meta.isNotStray.isSpayed": true
    }];

    const expectedData = [{
        "id": "1",
        "name": "Cat",
        "tags": [{
            "id": "t2",
            "tag": "animal",
            "description": null,
            "meta": {
                "isHungry": true,
                "isCute": false,
                "isNotStray": {
                    "hasName": true,
                    "isSpayed": true
                }
            }
        }]
    }]

    const formattedData = dogInstance.convert(data);
    t.deepEqual(formattedData, expectedData);
});

test('Convert multiple. Push to array if not plainObject', async t => {
    const data = [{
        "id": "1",
        "name": "Cat",
        "metaData": 'valueA'
    },{
        "id": "1",
        "name": "Cat",
        "metaData": 'valueB'
    }];

    const expectedData = [{
        "id": "1",
        "name": "Cat",
        "metaData": ['valueA', 'valueB']
    }]

    const formattedData = dogInstance.convert(data);
    t.deepEqual(formattedData, expectedData);
});

test('Convert multiple. Push to array if not plainObject. Removes duplicates', async t => {
    const data = [{
        "id": "1",
        "name": "Cat",
        "metaData": 'valueA'
    },{
        "id": "1",
        "name": "Cat",
        "metaData": 'valueB'
    },
    {
        "id": "1",
        "name": "Cat",
        "metaData": 'valueB'
    }];

    const expectedData = [{
        "id": "1",
        "name": "Cat",
        "metaData": ['valueA', 'valueB']
    }]

    const formattedData = dogInstance.convert(data);
    t.deepEqual(formattedData, expectedData);
});

test('Convert multiple. Push to array if not plainObject 2', async t => {
    const data = [{
        "id": "1",
        "name": "Cat",
        "metaData": 'valueA'
    },{
        "id": "1",
        "name": "Cat",
        "metaData": 'valueB'
    },{
        "id": "1",
        "name": "Cat",
        "metaData": 'valueC'
    }];

    const expectedData = [{
        "id": "1",
        "name": "Cat",
        "metaData": ['valueA', 'valueB', 'valueC']
    }]

    const formattedData = dogInstance.convert(data);
    t.deepEqual(formattedData, expectedData);
});

test('Convert multiple. 3 level nest. With custom delimiter', async t => {
    let thisDogInstance = new DeepObjectGraph({
        delimiter: ':'
    });
    
    const data = [{
        "id": "1",
        "name": "Cat",
        "tags:id": "t2",
        "tags:tag": "animal",
        "tags:description": null,
        "tags:meta:isHungry": true,
        "tags:meta:isCute": false,
        "tags:meta:isNotStray:hasName": true
    },{
        "id": "1",
        "name": "Cat",
        "tags:id": "t2",
        "tags:tag": "animal",
        "tags:description": null,
        "tags:meta:isHungry": true,
        "tags:meta:isCute": false,
        "tags:meta:isNotStray:isSpayed": true
    }];

    const expectedData = [{
        "id": "1",
        "name": "Cat",
        "tags": {
            "id": "t2",
            "tag": "animal",
            "description": null,
            "meta": {
                "isHungry": true,
                "isCute": false,
                "isNotStray": {
                    "hasName": true,
                    "isSpayed": true
                }
            }
        }
    }]

    const formattedData = thisDogInstance.convert(data);
    t.deepEqual(formattedData, expectedData);
});

test('Multiple different parents.', async t => {
    const data = [{
        "id": "1",
        "name": "Cat",
        "tags.id": "t1",
        "tags.tag": "black",
        "tags.description": null,
        "tags.meta.fieldA": 'placeholder',
        "tags.meta.fieldB": null,
    },{
        "id": "2",
        "name": "Dog",
        "tags.id": "t1",
        "tags.tag": "black",
        "tags.description": null,
        "tags.meta.fieldA": 'placeholder',
        "tags.meta.fieldB": false,
    }];

    const expectedData = [{
        "id": "1",
        "name": "Cat",
        "tags": [{
            "id": "t1",
            "tag": "black",
            "description": null,            
            "meta": {
                "fieldA": 'placeholder',
                "fieldB": null
            }
        }]
    },{
        "id": "2",
        "name": "Dog",
        "tags": [{
            "id": "t1",
            "tag": "black",
            "description": null,            
            "meta": {
                "fieldA": 'placeholder',
                "fieldB": false
            }
        }]
    }]

    const formattedData = dogInstance.convert(data);
    t.deepEqual(formattedData, expectedData);
});

test('Multiple different parents with special nested key', async t => {
    const data = [{
        "id": "1",
        "name": "Cat",
        "pre.tags.id": "t1",
        "pre.tags.tag": "black",
        "pre.tags.description": null,
        "pre.tags.meta.fieldA": 'placeholder',
        "pre.tags.meta.fieldB": null,
    },{
        "id": "2",
        "name": "Dog",
        "pre.tags.id": "t1",
        "pre.tags.tag": "black",
        "pre.tags.description": null,
        "pre.tags.meta.fieldA": 'placeholder',
        "pre.tags.meta.fieldB": false,
    }];

    const expectedData = [{
        "id": "1",
        "name": "Cat",
        "pre": {
            "tags": [{
                "id": "t1",
                "tag": "black",
                "description": null,            
                "meta": {
                    "fieldA": 'placeholder',
                    "fieldB": null
                }
            }]
        }
        
    },{
        "id": "2",
        "name": "Dog",
        "pre": {
            "tags": [{
                "id": "t1",
                "tag": "black",
                "description": null,            
                "meta": {
                    "fieldA": 'placeholder',
                    "fieldB": false
                }
            }]
        }
    }]

    const formattedData = dogInstance.convert(data);
    t.deepEqual(formattedData, expectedData);
});

test('Same parents.', async t => {
    const data = [{
        "id": "1",
        "name": "Cat",
        "tags.id": "t2",
        "tags.tag": "animal",
        "tags.description": null,
        "tags.meta": {
            "isHungry": true
        },
    },{
        "id": "1",
        "name": "Cat",
        "tags.id": "t1",
        "tags.tag": "colour",
        "tags.description": null,
        "tags.meta": {
            "isBlack": false
        }
    },{
        "id": "1",
        "name": "Cat",
        "tags.id": "t3",
        "tags.tag": "fur",
        "tags.description": null,
        "tags.meta": {
            "isFurry": true
        },
    }];

    const expectedData = [{
        "id": "1",
        "name": "Cat",
        "tags": [{
            "id": "t2",
            "tag": "animal",
            "description": null,
            "meta": {
                "isHungry": true
            },
        },{
            "id": "t1",
            "tag": "colour",
            "description": null,
            "meta": {
                "isBlack": false
            },
        },{
            "id": "t3",
            "tag": "fur",
            "description": null,
            "meta": {
                "isFurry": true
            }
        }]
    }];

    const formattedData = dogInstance.convert(data);
    t.deepEqual(formattedData, expectedData);
});

test('Same parents. Nested different objects with different id.', async t => {
    const data = [{
        "id": "1",
        "name": "Cat",
        "tags.id": "t2",
        "tags.tag": "animal",
        "tags.description": null,
        "tags.meta": {
            "id": 1,
            "isHungry": true
        }
    },{
        "id": "1",
        "name": "Cat",
        "tags.id": "t2",
        "tags.tag": "animal",
        "tags.description": null,
        "tags.meta": {
            "id": 2,
            "isFat": true
        }
    },{
        "id": "1",
        "name": "Cat",
        "tags.id": "t1",
        "tags.tag": "colour",
        "tags.description": null,
        "tags.meta": {
            "id": 1,
            "isBlack": true
        },
    }];

    const expectedData = [{
        "id": "1",
        "name": "Cat",
        "tags": [{
            "id": "t2",
            "tag": "animal",
            "description": null,
            "meta": [{
                "id": 1,
                "isHungry": true
            }, {
                "id": 2,
                "isFat": true
            }],
        },{
            "id": "t1",
            "tag": "colour",
            "description": null,
            "meta": {
                "id": 1,
                "isBlack": true
            }
        }]
    }];

    const formattedData = dogInstance.convert(data);
    t.deepEqual(formattedData, expectedData);
});

test('Same parents. Nested different objects with same id.', async t => {
    // TODO object with similar id should merge itself instead of wrapped by array.
    const data = [{
        "id": "1",
        "name": "Cat",
        "tags.id": "t2",
        "tags.tag": "animal",
        "tags.description": null,
        "tags.meta": {
            "id": 1,
            "isHungry": true
        }
    },{
        "id": "1",
        "name": "Cat",
        "tags.id": "t2",
        "tags.tag": "animal",
        "tags.description": null,
        "tags.meta": {
            "id": 1,
            "isReallyHungry": true
        }
    },{
        "id": "1",
        "name": "Cat",
        "tags.id": "t4",
        "tags.tag": "temper",
        "tags.description": null,
        "tags.meta": {
            "id": 1,
            "illTempered": true
        },
    }];

    const expectedData = [{
        "id": "1",
        "name": "Cat",
        "tags": [{
            "id": "t2",
            "tag": "animal",
            "description": null, 
            "meta": {
                "id": 1,
                "isHungry": true,
                "isReallyHungry": true   
            }
        },{
            "id": "t4",
            "tag": "temper",
            "description": null,
            "meta": {
                "id": 1,
                "illTempered": true
            }
        }]
    }];

    const formattedData = dogInstance.convert(data);
    t.deepEqual(formattedData, expectedData);
});

test('Same parents with IDless objects.', async t => {
    const data = [{
        "id": "1",
        "name": "Cat",
        "tags.id": "t2",
        "tags.tag": "animal",
        "tags.description": null,
        "tags.meta.fluffy": true
    },{
        "id": "1",
        "name": "Cat",
        "tags.id": "t2",
        "tags.tag": "animal",
        "tags.description": null,
        "tags.meta.fourLegged": true,
    }];

    const expectedData = [{
        "id": "1",
        "name": "Cat",
        "tags": [{
            "id": "t2",
            "tag": "animal",
            "description": null,
            "meta": {
                "fluffy": true,
                "fourLegged": true
            }
        }]
    }]

    const formattedData = dogInstance.convert(data);
    t.deepEqual(formattedData, expectedData);
});

test('specialKeyDefaultToArray and field options', async t => {
    const data = [{
        "id": "1",
        "name": "Cat",
        "tags.id": "t2",
        "tags.tag": "animal",
        "tags.description": null,
        "tags.meta.fluffy": true,
        "tags.meta.fourLegged": true
    }];

    const expectedData = [{
        "id": "1",
        "name": "Cat",
        "tags": [{
            "id": "t2",
            "tag": "animal",
            "description": null,
            "meta": {
                "fluffy": true,
                "fourLegged": true
            }
        }]
    }]

    const formattedData = dogInstance.convert(data);
    t.deepEqual(formattedData, expectedData);
});

test('Multiple Objects. Multiple parents.', async t => {
    const data = [{
        "id": "1",
        "name": "Cat",
        "tags.id": "t2",
        "tags.tag": "animal",
        "tags.description": null,
        "tags.meta": {
            "fieldA": true
        }
    },{
        "id": "1",
        "name": "Cat",
        "tags.id": "t1",
        "tags.tag": "colour",
        "tags.description": null,
        "tags.meta": {
            "fieldB": true
        },
    },{
        "id": "2",
        "name": "Dog",
        "tags.id": "t2",
        "tags.tag": "animal",
        "tags.description": null,
        "tags.meta": {
            "fieldA": true
        }
    },{
        "id": "2",
        "name": "Dog",
        "tags.id": "t1",
        "tags.tag": "colour",
        "tags.description": null,
        "tags.meta": {
            "fieldB": true
        }
    }];

    const expectedData = [{
        "id": "1",
        "name": "Cat",
        "tags": [{
            "id": "t2",
            "tag": "animal",
            "description": null,
            "meta": {
                "fieldA": true
            }
        },{
            "id": "t1",
            "tag": "colour",
            "description": null,
            "meta": {
                "fieldB": true
            }
        }]
    },{
        "id": "2",
        "name": "Dog",
        "tags": [{
            "id": "t2",
            "tag": "animal",
            "description": null,            
            "meta": {
                "fieldA": true   
            }
        },{
            "id": "t1",
            "tag": "colour",
            "description": null,
            "meta": {
                "fieldB": true
            }
        }]
    }];

    const formattedData = dogInstance.convert(data);
    t.deepEqual(formattedData, expectedData);
});
