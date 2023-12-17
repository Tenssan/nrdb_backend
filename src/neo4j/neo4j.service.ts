import { Injectable, OnModuleInit } from '@nestjs/common';
import { Driver } from 'neo4j-driver';
import * as neo4j from 'neo4j-driver';


@Injectable()
export class Neo4jService implements OnModuleInit {
  private driver: Driver;

  constructor() {
    const neo4jUri = 'neo4j+s://ef4a2ed9.databases.neo4j.io';
    const neo4jUser = 'neo4j';
    const neo4jPassword = 'Q5ZCxq4wLbKEa1vycn_v274dUaSvZY98kml-q3oss64';

    this.driver = neo4j.driver(neo4jUri, neo4j.auth.basic(neo4jUser, neo4jPassword));
  }

  async onModuleInit(): Promise<void> {
    try {
      await this.testConnection();
      console.log('Neo4j connection successful.');
    } catch (error) {
      console.error('Error connecting to Neo4j:', error);
      throw error; 
    }
  }

  private async testConnection(): Promise<void> {
    const session = this.driver.session();
    try {
     
      await session.run('MATCH (n) RETURN n LIMIT 1');
    } finally {
      await session.close();
    }
  }
  async createUser(userId: string, userName: string) {
    const session = this.driver.session();
    try {
      await session.run(`CREATE (u:User {id: $userId, name: $userName})`, { userId, userName });
    } finally {
      await session.close();
    }
  }

  async createProduct(productId: string, productName: string, category: string) {
    const session = this.driver.session();
    try {
      await session.run(`CREATE (p:Product {id: $productId, name: $productName, category: $category})`, { productId, productName, category });
    } finally {
      await session.close();
    }
  }

  async recordClick(userId: string, productId: string) {
    const session = this.driver.session();
    try {
      await session.run(`
        MATCH (u:User {id: $userId}), (p:Product {id: $productId})
        CREATE (u)-[:CLICKED_ON]->(p)
      `, { userId, productId });
    } finally {
      await session.close();
    }
  }

  async recommendProducts(userId: string): Promise<any[]> {
    const session = this.driver.session();
    try {
      const result = await session.run(`
        MATCH (u:User {id: $userId})-[:CLICKED_ON]->(p:Product)
        WITH p.category AS category
        MATCH (recommended:Product)
        WHERE recommended.category = category AND NOT (u)-[:CLICKED_ON]->(recommended)
        RETURN recommended
      `, { userId });
      return result.records.map(record => record.get('recommended').properties);
    } finally {
      await session.close();
    }
  }

  
}
