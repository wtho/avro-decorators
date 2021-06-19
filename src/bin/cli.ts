#!/usr/bin/env node

import { runAvroDecorators } from "../internals/program";
runAvroDecorators(process.argv, process.exit, console)
