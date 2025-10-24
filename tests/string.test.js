const request = require('supertest');
const app = require('../src/app');
const { stringStorage } = require('../src/models/stringAnalysis');

describe('String Analysis API', () => {
  beforeEach(() => {
    stringStorage.clear();
  });

  describe('POST /strings', () => {
    it('should analyze a string and return properties', async () => {
      const response = await request(app)
        .post('/strings')
        .send({ value: 'hello world' })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.value).toBe('hello world');
      expect(response.body.properties.length).toBe(11);
      expect(response.body.properties.is_palindrome).toBe(false);
      expect(response.body.properties.word_count).toBe(2);
      expect(response.body.properties.character_frequency_map).toHaveProperty('h', 1);
    });

    it('should return 409 for duplicate string', async () => {
      await request(app).post('/strings').send({ value: 'test' });
      const response = await request(app)
        .post('/strings')
        .send({ value: 'test' })
        .expect(409);

      expect(response.body.error).toBe('String already exists');
    });

    it('should return 400 for missing value', async () => {
      const response = await request(app)
        .post('/strings')
        .send({})
        .expect(400);

      expect(response.body.error).toContain('Missing required field');
    });
  });

  describe('GET /strings/:string_value', () => {
    it('should return analyzed string', async () => {
      await request(app).post('/strings').send({ value: 'madam' });
      
      const response = await request(app)
        .get('/strings/madam')
        .expect(200);

      expect(response.body.value).toBe('madam');
      expect(response.body.properties.is_palindrome).toBe(true);
    });

    it('should return 404 for non-existent string', async () => {
      const response = await request(app)
        .get('/strings/nonexistent')
        .expect(404);

      expect(response.body.error).toBe('String not found');
    });
  });

  describe('GET /strings with filters', () => {
    beforeEach(async () => {
      await request(app).post('/strings').send({ value: 'a' });
      await request(app).post('/strings').send({ value: 'madam' });
      await request(app).post('/strings').send({ value: 'hello world' });
    });

    it('should filter by palindrome', async () => {
      const response = await request(app)
        .get('/strings?is_palindrome=true')
        .expect(200);

      expect(response.body.count).toBe(1);
      expect(response.body.data[0].value).toBe('madam');
    });

    it('should filter by length', async () => {
      const response = await request(app)
        .get('/strings?min_length=3&max_length=5')
        .expect(200);

      expect(response.body.data.every(item => 
        item.properties.length >= 3 && item.properties.length <= 5
      )).toBe(true);
    });
  });

  describe('Natural language filtering', () => {
    beforeEach(async () => {
      await request(app).post('/strings').send({ value: 'a' });
      await request(app).post('/strings').send({ value: 'racecar' });
      await request(app).post('/strings').send({ value: 'hello world' });
    });

    it('should parse "single word palindromic strings"', async () => {
      const response = await request(app)
        .get('/strings/filter-by-natural-language?query=single%20word%20palindromic%20strings')
        .expect(200);

      expect(response.body.interpreted_query.parsed_filters).toEqual({
        is_palindrome: true,
        word_count: 1
      });
    });
  });

  describe('DELETE /strings/:string_value', () => {
    it('should delete existing string', async () => {
      await request(app).post('/strings').send({ value: 'to delete' });
      await request(app)
        .delete('/strings/to delete')
        .expect(204);

      await request(app)
        .get('/strings/to delete')
        .expect(404);
    });

    it('should return 404 for non-existent string on delete', async () => {
      await request(app)
        .delete('/strings/nonexistent')
        .expect(404);
    });
  });
});