'use strict';

import {Router} from 'express';
import controller from './blog.controller';

var router = new Router();

router.get('/', controller.index);
router.get('/:post', controller.show);
router.post('/', controller.create);
router.delete('/:post', controller.destroy);
router.put('/:post',  controller.update);


module.exports = router;
