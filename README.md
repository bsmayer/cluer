<h3>CLUER</h3>

<b>Motivation:</b> have you ever seen yourself needing to compose a response
to your front-end coming from multiple backends?
It can be a pain, not to mention that sometimes you don't need all the data
provided from your backend APIs. For that, we have many different API gateways
and solutions that are not always easy to use, and not as simple as we need. <br />
Cluer was born to simplify this whole process. It's fast, easy to configurate, 
made with pure Javascript and totally customizable.

<h4>What you need to know</h4>

This is yet an experimental project. Feel free to use in production, but with caution.
Colaborations are always welcome. Any issues that you have, feel free to share
with me. <br />
This project was made to be simple. If you need a more complex solution, you may
try some others alternatives. Believe, there are plenty of them.

<h4>Usage and examples</h4>

In <u>examples</u> folder you will find many use cases to apply in your APIs. <br />
Everything that Cluer can do is in there, so don't be afraid of spending some time
looking at it. The idea is to keep all these examples updated, but things can go
wrong. If you don't find what you need, feel free to ask. 

<h4>Installing</h4>

<h5>1. Using on a new project</h5>

First, add it to your project by running yarn or npm.

````
yarn add cluer
````

Then import cluer to your project

````
const cluer = require('cluer');
````

Cluer uses Express JS behind the scene, so what we need to do is to provide
a configuration file and alternatively provide a PORT to startup your api. <br />
Simple as that:

````
const endpoints = require('endpoints.json');

cluer.init(endpoints, {
    port: 3000
});
````

Great, so now we are just one step away of getting our api up and running. <br />
We need now to create the endpoints configuration file. The following lines have
a short example of how to do that. 

````
{
    "version": 1,
    "name": "Hello Cluer World",
    "endpoints": [
        {
            "path": "/api/aggregate",
            "method": "GET",
            "backends": [
                {
                    "key": "account",
                    "host": "http://www.mocky.io",
                    "path": "/v2/5d010e843200000d00f9da23",
                    "method": "GET"
                },
                {
                    "key": "videos",
                    "host": "http://www.mocky.io",
                    "path": "/v2/5cffad0c3200003800eac8bc",
                    "method": "GET"
                },
                {
                    "key": "permissions",
                    "host": "http://www.mocky.io",
                    "path": "/v2/5cffad193200000d00eac8bd",
                    "method": "GET"
                }
            ],
            "response": {
                "root": [ "$account", "$videos", "$permissions" ]
            }
        }
    ]
}
````

And you're ready to go! 

<h4>Parameters and querystrings</h4>

As Cluer uses ExpressJS behind the scenes, parameters and querystring are most like 
the same. You can specify parameters by adding it directly to your route:

````
{
    "endpoints": [{
        "path": "/api/aggregate/:videoId",
        "backends": [ ... ],
        "response": { ... }
    }]
}
````

Querystrings are captured when a querystring object is specified. 
Let's see how to use it:

````
{
    "endpoints": [{
        "path": "/api/aggregate",
        "querystring": [ "videoId" ],
        "backends": [{
            "key": "videos",
            "host": "http://www.mocky.io",
            "path": "/v2/:videoId"
        }],
        "response": { ... }
    }]
}
````

Note that we are receiving a value from a querystring called videoId, and passing
as a parameter to one of our backend routes. But what if you want to receive a value
in your path and pass as a querystring to your backend? Let's see how it goes:

````
{
    "endpoints": [{
        "path": "/api/aggregate/:videoId",
        "backends": [{
            "key": "videos",
            "host": "http://www.mocky.io",
            "path": "/v2/5cffad193200000d00eac8bd",
            "querystring": [ "videoId" ]
        }],
        "response": { ... }
    }]
}
````

<h4>Payloads</h4>

Cluer can receive and forward payloads to your backends. It's easy and accessible 
using the keyword "$body". Working with $body is pretty much the same as handling
responses. You can use JSONPath to resolve and translate your data.

````
{
    "endpoints": [{
        "path": "/api/aggregate/:videoId",
        "method": "POST",
        "backends": [{
            "key": "videos",
            "host": "http://www.mocky.io",
            "path": "/v2/5cffad193200000d00eac8bd",
            "method": "POST",
            "body": "$body"
        }],
        "response": { ... }
    }]
}
````

The above example shows how to pass your entire $body to a single backend. But what 
if we wanted to break our $body into two pieces?

````
{
    "endpoints": [{
        "path": "/api/aggregate/:videoId",
        "method": "POST",
        "backends": [
            {
                "key": "videos",
                "host": "http://www.mocky.io",
                "path": "/v2/5cffad193200000d00eac8bd",
                "method": "POST",
                "body": {
                    "video": "$body.video"
                }
            },
            {
                "key": "account",
                "host": "http://www.mocky.io",
                "path": "/v2/5cffad193200000d00eac8bd",
                "method": "POST",
                "body": "$body.account"
            }
        ],
        "response": { ... }
    }]
}
````

This should do the trick.

<h4>Customizing your response</h4>

With Cluer you can easily change your response according to what your consumers expect. 
It's defined by adding a "response" property to your backend. By default, you always need to have a "root"
property. The root will tell Cluer how to compose your response, and you can define it by using 
an array or a custom object. <br />

When pointing the root to an array of backend responses, you should specify exactly which keys you want to 
add to the root of your response, like this:

````
{
    endpoints: [{
        "path": "/api/aggregate",
        "backends": [
            { "key": "account", ... }, 
            { "key": "videos", ... }
        ],
        "response": {
            "root": [ "$account", "$videos" ]
        }
    }]
}
````

However, you might want to change one specifc property of your root, or create a brand new object <u>based</u> on
one of your backend's responses. Achieving that is very simple:

````
{
    endpoints: [{
        "path": "/api/aggregate",
        "backends": [
            { "key": "account", ... }, 
            { "key": "videos", ... }
        ],
        "response": {
            "root": [ "$account", "$videos" ],
            "set": {
                "user_video_url": "$videos.url",
                "accountId": "$videos.url"
            }
        }
    }]
}
````

Be aware that if in your "set" object you create a property which already exists in your root, it will be replaced
to the new value.

Now let's suppose you want to compose your root from scratch, you can do it by assigning root to a new object:

````
{
    endpoints: [{
        "path": "/api/aggregate",
        "backends": [
            { "key": "account", ... }, 
            { "key": "videos", ... }
        ],
        "response": {
            "root": {
                "account_name": "$account.name",
                "account_id": "$account.id",
                "videos": {
                    "url": "$videos.url",
                    "description": "$videos.name"
                }
            }
        }
    }]
}
````

<h4>Lifecycle methods</h4>

You can use lifecycle methods to intercept and change the behaviour of your API. 
For each lifecycle method you will receive a context. If you need to modify this context, you need to return
a brand new object. In other words, Cluer expects your lifecycle methods to be pure functions. 

Using lifecycle methods is as simple as putting a require() in your code. You just need to point your endpoint
to the file where your methods are:

````
{
    "endpoints": [{
        "path": "/api/aggregate",
        "lifecycleHandlers": "./myHandlers.js",
        "backends": [ ... ],
        "response": { ... }
    }]
}
````

Now that you told Cluer to use a lifecycle handler, all you need to do is to create
a file exporting the methods you want to call in the middle of your execution. 
Note that you can see a full usage of this inside the examples folder.

````
async function beforeAnyBackendRequest(context) {
	console.log('1 - fired before any backend request', context);
	return context;
}

async function afterAllBackendRequests(context) {
	console.log('2 - fired after all backends returned', context);
	return context;
}

async function onAnyBackendRequestError(error) {
	console.log('3 - fired on any backend error', error);
	return error;
}

async function onFinishMappingResponse(context) {
    console.log('4 - fired after our custom response was mounted', context);
	return context;
}

const account = {
	async beforeBackendRequest(context) {
		console.log('5 - fired before ACCOUNT backend request', context);
		return context;
	},
	async afterBackendRequest(context) {
		console.log('6 - fired after ACCOUNT backend returned', context);
		return context;
	},
	async onBackendRequestError(error) {
		console.log('7 - fired if ACCOUNT backend request throws an error', error);
		return error;
	}
};

const videos = {
	async beforeBackendRequest(context) {
		console.log('5 - fired before VIDEOS backend request', context);
		return context;
	},
	async afterBackendRequest(context) {
		console.log('6 - fired after VIDEOS backend returned', context);
		return context;
	},
	async onBackendRequestError(error) {
		console.log('7 - fired if VIDEOS backend request throws an error', error);
		return error;
	}
};

module.exports = {
	beforeAnyBackendRequest,
	afterAllBackendRequests,
	onAnyBackendRequestError,
	onFinishMappingResponse,
	account,
	videos
};
````

<h4>Share your experience and knowledge</h4>

Help improving Cluer. Send a PR and feel free to change it as you need. <br />
For any questions you have, send us a message! <br />
Cheers. 
