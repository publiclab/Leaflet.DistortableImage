/// <reference types="node" />

/**
Create a hash for file revving.

@param input - Data to create a hash from.

@example
```
import * as fs from 'fs';
import revisionHash = require('rev-hash');

revisionHash(fs.readFileSync('unicorn.png'));
//=> 'bb9d8fe615'

revisionHash('Lorem ipsum dolor sit amet');
//=> 'fea80f2db0'
```
*/
declare function revisionHash(input: Buffer | string): string;

export = revisionHash;
