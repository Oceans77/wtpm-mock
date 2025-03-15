// src/models/jsonFileAdapter.js
/**
 * This adapter provides a way to use JSON files for user data storage
 * It's a simple implementation for development and can be replaced with a database later
 */
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class JsonFileAdapter {
  constructor(entityName) {
    this.entityName = entityName;
    this.dataDir = path.join(__dirname, '../data');
    this.filePath = path.join(this.dataDir, `${entityName}.json`);
    
    // Initialize the data directory and file
    this.initStorage();
  }

  initStorage() {
    // Create data directory if it doesn't exist
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }

    // Create an empty JSON file if it doesn't exist
    if (!fs.existsSync(this.filePath)) {
      fs.writeFileSync(this.filePath, JSON.stringify([], null, 2));
    }
  }

  readData() {
    try {
      const data = fs.readFileSync(this.filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error(`Error reading ${this.entityName} data:`, error);
      return [];
    }
  }

  writeData(data) {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2));
      return true;
    } catch (error) {
      console.error(`Error writing ${this.entityName} data:`, error);
      return false;
    }
  }

  async findAll() {
    return this.readData();
  }

  async findById(id) {
    const entities = this.readData();
    return entities.find(entity => entity.id === id) || null;
  }

  async findOne(query) {
    const entities = this.readData();
    
    return entities.find(entity => {
      return Object.entries(query).every(([key, value]) => {
        return entity[key] === value;
      });
    }) || null;
  }

  async create(data) {
    const entities = this.readData();
    const newEntity = {
      id: data.id || uuidv4(),
      ...data,
      createdAt: data.createdAt || new Date(),
      updatedAt: new Date()
    };

    entities.push(newEntity);
    this.writeData(entities);
    
    return newEntity;
  }

  async update(id, data) {
    const entities = this.readData();
    const index = entities.findIndex(entity => entity.id === id);
    
    if (index === -1) {
      return null;
    }

    const updatedEntity = {
      ...entities[index],
      ...data,
      updatedAt: new Date()
    };

    entities[index] = updatedEntity;
    this.writeData(entities);
    
    return updatedEntity;
  }

  async delete(id) {
    const entities = this.readData();
    const index = entities.findIndex(entity => entity.id === id);
    
    if (index === -1) {
      return false;
    }

    entities.splice(index, 1);
    this.writeData(entities);
    
    return true;
  }
}

module.exports = JsonFileAdapter;
