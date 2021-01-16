/* eslint-disable @typescript-eslint/no-var-requires */
require('@babel/register')({
  ...require('../../babel.config.json'),
  extensions: ['.js', '.ts', '.mjs'],
})



module.exports = function(test) {
  try {
    test.contents = babel.transform(test.contents, options).code;
  } catch (error) {
    test.result = {
      stderr: `${error.name}: ${error.message}\n`,
      stdout: '',
      error
    };
  }

  return test;
};