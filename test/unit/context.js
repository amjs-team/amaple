context = require.context('../../src', true, /\.js$/);
context.keys().forEach(context);

context = require.context('./', true, /\.spec\.js$/);
context.keys().forEach(context);