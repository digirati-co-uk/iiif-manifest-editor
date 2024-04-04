import { addDecorator } from 'manifest-editor';

addDecorator(app => {
  return app();
})
