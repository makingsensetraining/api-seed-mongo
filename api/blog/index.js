'use strict';

import config from '../../config/environment';

import {Router} from 'express';
import controller from './blog.controller';

var router = new Router();

router.get('/', controller.index);

// router.post('/', controller.create);
// router.get('/:user', controller.show);
// router.put('/:user',  controller.update);
// router.delete('/:id', controller.destroy);

module.exports = router;
