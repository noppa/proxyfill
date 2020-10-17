/* eslint-disable @typescript-eslint/no-var-requires */
require('@babel/register')({
  ...require('../../babel.config.json'),
  extensions: ['.js', '.ts', '.mjs'],
})