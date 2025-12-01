import { describe, it, expect } from 'vitest';
import Ajv from 'ajv';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Recursively list JSON files in a directory
 */
function listJsonFiles(dir: string): string[] {
  const results: string[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...listJsonFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.json')) {
      results.push(fullPath);
    }
  }

  return results;
}

/**
 * Load JSON from file path
 */
function loadJson(filePath: string): any {
  const content = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(content);
}

describe('Public config against JSON schemas', () => {
  it('validates every file under public/config/ against its referenced schema', () => {
    const configsDir = path.resolve(process.cwd(), 'public', 'config');
    const files = listJsonFiles(configsDir);

    const ajv = new Ajv({ allErrors: true, strict: false });

    // Preload all schemas in public/schemas to avoid duplicate schema registration per test
    const schemasDir = path.resolve(process.cwd(), 'public', 'schemas');
    if (fs.existsSync(schemasDir)) {
      const schemaFiles = listJsonFiles(schemasDir);
      for (const sPath of schemaFiles) {
        const s = loadJson(sPath);
        // Avoid adding the same schema twice
        try {
          // If schema has $id use it for registering; otherwise use path
          const key = (s && s.$id) ? s.$id : sPath;
          if (!ajv.getSchema(key)) {
            ajv.addSchema(s as any, key);
          }
        } catch (err) {
          // Ignore duplicates or errors; we'll still compile when validating
        }
      }
    }

    for (const cfgPath of files) {
      const cfg = loadJson(cfgPath);

      // Determine schema path via $schema on config; if missing, infer based on filename
      let schemaRef: string | undefined = cfg?.$schema;
      if (!schemaRef) {
        // Fallback: map filename to schema under public/schemas (e.g., attributes.json -> attributes.schema.json)
        const name = path.basename(cfgPath, '.json');
        const defaultSchema = path.resolve(process.cwd(), 'public', 'schemas', `${name}.schema.json`);
        if (fs.existsSync(defaultSchema)) {
          schemaRef = defaultSchema;
        }
      }

      expect(schemaRef, `${cfgPath} should include a $schema or have a matching schema filename`).toBeDefined();

      // Resolve relative schema path if necessary
      let schemaPath = schemaRef as string;
      if (!path.isAbsolute(schemaPath)) {
        schemaPath = path.resolve(path.dirname(cfgPath), schemaPath);
      }

      expect(fs.existsSync(schemaPath), `${cfgPath} references a schema path that doesn't exist: ${schemaPath}`).toBeTruthy();

      const schema = loadJson(schemaPath);

      // Ensure the schema is registered and used to validate the config
      let validate = undefined as any;
      if (schema && schema.$id && ajv.getSchema(schema.$id)) {
        validate = ajv.getSchema(schema.$id) as any;
      } else {
        validate = ajv.compile(schema as any);
      }
      const valid = validate(cfg);
      if (!valid) {
        // Provide detailed errors for easier debugging in test output
        const message = (validate.errors || []).map((e) => `${e.instancePath} ${e.message}`).join(', ');
        expect(valid, `Schema validation failed for ${cfgPath}: ${message}`).toBeTruthy();
      } else {
        expect(valid).toBeTruthy();
      }
    }
  });
});
