/**
 * @file This file is a compatibility bridge for the application's entry point.
 * It ensures that if any build process accidentally uses this file as an entry point,
 * it correctly executes the main entry point located in the /src directory.
 */
import './src/main.tsx';
