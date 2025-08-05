import request from 'supertest';
import { describe, it } from 'vitest';

describe('Project API Integration Tests', () => {
  it('should create a new project', async () => {
    const response = await request(
      `http://localhost:${process.env.PORT}/${process.env.BASE_PATH}/project`
    )
      .post('/create')
      .send({
        name: 'Test Project',
        describe: 'This is a test project',
        databaseType: 'mongodb',
        tag: ['test', 'project'],
        connectionString: 'mongodb://localhost:27017/testdb',
        templateType: 'none'
      })
      .expect(201)
      .expect('Content-Type', /json/);

    console.log('Create Project Response:', response.body);
  });
});
