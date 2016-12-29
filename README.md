# Deep Object Graph

[![Build Status](https://travis-ci.org/JunJi-T/deep-object-graph.svg?branch=master)](https://travis-ci.org/JunJi-T/deep-object-graph)

An alternative to [treeize](https://github.com/kwhitley/treeize).

Converts flat JSON `objects` into deep object graph. 


## Purpose


Results that comes back from a SQL join query usually have many duplicated data (depending on how complex the joins are). 

`deep-object-graph` converts this flat data into a clean and readable JSON by removing these duplicated data and merging data that shares the same parent entity.



## Usage


Install it.

```bash
npm install deep-object-graph --save
```

To use.

**Note:** Each `object` needs to have an unique field to identify them with other objects that share the same unique field for merging. By Default this field name is **'id'**, it is configurable with `options.primaryKeyField`.

```js
import deepObjectGraph from 'deep-object-graph';
// const deepObjectGraph = require('deep-object-graph').default; // es5-syntax.

// Create new instance with default options shown.
const dogInstance = new deepObjectGraph({
	primaryKeyField: 'id', // The key name of the unique field to identify an object.
    delimiter: '.', // The delimiter char to determine nesting.
    specialKeyArray: [] // The key name of fields where values will be in an array even if there is only one object.
}); 

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

let results = dogInstance.convert(data);

// 'results' will be...
[{
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
```

## Examples

```js
// Input...
[
	{
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
	}
]

// Output...
[
	{
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
	}
]
```
----
Convert to array if value type is non-object.

```js
// Input...
[
	{
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
    }
]

// Output...
[
	{
        "id": "1",
        "name": "Cat",
        "metaData": ['valueA', 'valueB', 'valueC']
    }
]
```
----
`primaryKeyField` option.

```js
let thisDogInstance = new DeepObjectGraph({
    primaryKeyField: 'uuid'
});

// Input...
[
	{
        "uuid": "1",
        "name": "Cat",
        "tags.uuid": "t2",
        "tags.tag": "animal",
        "tags.description": null,
        "tags.metadata": {
            "isStray": true
        }
    }
]

// Output...
[
	{
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
    }
]
```

----
`delimiter` option.

```js
let dogInstance = new DeepObjectGraph({
    delimiter: ':'
});

// Input...
[
	{
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
	}
]

// Output...
[
	{
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
    }
]
```
----
`specialKeyArray` option to force value into an array.

```js
let dogInstance = new DeepObjectGraph({
    specialKeyArray: ['tags']
});

// Input...
[
	{
        "id": "1",
        "name": "Cat",
        "tags.id": "t2",
        "tags.tag": "animal",
        "tags.description": null,
        "tags.metadata": {
            "isStray": true
        }
	}
];

// Output...
[
	{
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
	}
]
```
Refer to [test.js](https://github.com/junji-t/deep-object-graph/blob/master/test.js) for more examples.

