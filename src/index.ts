import UI from './ui';
import { global, INSTANCE_VAR } from './ui/utils';

const ui = new UI;
ui.start();

(global as any)[INSTANCE_VAR] = ui;
