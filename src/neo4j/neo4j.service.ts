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

  async createProduct(
    productId: string, 
    productName: string, 
    description: string, 
    price: number, 
    brand: string, 
    inStock: boolean, 
    sizeAvailable: string[], 
    image: string, 
    reviews: string[], 
    category: string 
  ) {
    const session = this.driver.session();
    try {
      await session.run(`
        CREATE (p:Product {
          id: $productId, 
          name: $productName, 
          description: $description, 
          price: $price, 
          brand: $brand, 
          inStock: $inStock, 
          sizeAvailable: $sizeAvailable, 
          image: $image, 
          reviews: $reviews, 
          category: $category
        })`, 
        { 
          productId, 
          productName, 
          description, 
          price, 
          brand, 
          inStock, 
          sizeAvailable, 
          image, 
          reviews, 
          category 
        }
      );
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
    return true; 
  } catch (error) {
    console.error(error); 
    return false; 
  } finally {
    await session.close();
  }
}

async recommendProducts(userId: string): Promise<any[]> {
  console.log(`UserID: ${userId}`);
  const session = this.driver.session();
  try {
    const result = await session.run(`
    
      
      MATCH (u:User {id: $userId})-[:CLICKED_ON]->(p:Product)
      WITH u, p.category AS clickedCategory
      // Cuenta los clics por categoría
      RETURN clickedCategory, COUNT(*) AS clicks
      ORDER BY clicks DESC
    `, 
    { userId });

   
    const topCategories = result.records.map(record => record.get('clickedCategory'));
    
    if (topCategories.length === 0) return [];

    
    const recommendations = await session.run(`
      MATCH (u:User {id: $userId}), (product:Product)
      WHERE product.category IN $topCategories AND NOT EXISTS ((u)-[:CLICKED_ON]->(product))
      RETURN DISTINCT product
    `,
    { userId, topCategories });

    console.log(`Recommendations:`, recommendations.records.map(record => record.get('product').properties));
    return recommendations.records.map(record => record.get('product').properties);
    
  } finally {
    await session.close();
  }
}


  async recommendLaptopFurnitures(userId: string): Promise<any[]> {
    const session = this.driver.session();
  try {
    const result = await session.run(`
    
      MATCH (u:User {id: $userId})-[:CLICKED_ON]->(p:Product)
      WHERE p.category = 'Electronics' AND p.name CONTAINS 'Laptop'
      WITH u, COUNT(p) > 0 AS clickedLaptop

      
      MATCH (product:Product)
      WHERE clickedLaptop AND product.category = 'Furniture'
      RETURN DISTINCT product
    `, 
    { userId });

    console.log(`Recommendations:`, result.records.map(record => record.get('product').properties));
    return result.records.map(record => record.get('product').properties);
  } finally {
    await session.close();
  }
}
async recommendClothesProducts(userId: string): Promise<any[]> {
  const session = this.driver.session();
  try {
      const result = await session.run(`
      MATCH (u:User {id: $userId})-[:CLICKED_ON]->(clickedProduct:Product)
      WHERE clickedProduct.category = 'Clothes'
      RETURN DISTINCT clickedProduct
      `, 
      { userId });

      console.log(`Recommendations:`, result.records.map(record => record.get('clickedProduct').properties));
      return result.records.map(record => record.get('clickedProduct').properties);
      
  } finally {
      await session.close();
  }
}

async recommendElectronicsProducts(userId: string): Promise<any[]> {
  const session = this.driver.session();
  try {
      const result = await session.run(`
         
      MATCH (u:User {id: $userId})-[:CLICKED_ON]->(clickedProduct:Product)
      WHERE clickedProduct.category = 'Electronics'
      RETURN DISTINCT clickedProduct
      
      `, 
      { userId });

      console.log(`Recommendations:`, result.records.map(record => record.get('clickedProduct').properties));
      return result.records.map(record => record.get('clickedProduct').properties);
  } finally {
      await session.close();
  }
}

async recommendFurnitureProducts(userId: string): Promise<any[]> {
  const session = this.driver.session();
  try {
      const result = await session.run(`
      MATCH (u:User {id: $userId})-[:CLICKED_ON]->(clickedProduct:Product)
      WHERE clickedProduct.category = 'Furniture'
      RETURN DISTINCT clickedProduct
      `, 
      { userId });

      console.log(`Recommendations:`, result.records.map(record => record.get('clickedProduct').properties));
      return result.records.map(record => record.get('clickedProduct').properties);
  } finally {
      await session.close();
  }
}
async NoclicksProducts(userId: string, category: string): Promise<any[]> {
  const session = this.driver.session();
  try {
      const result = await session.run(`
      MATCH (p:Product)
      WHERE p.category = $category AND NOT (p)<-[:CLICKED_ON]-(:User {id: $userId})
      RETURN DISTINCT p
      `, 
      { userId: userId, category: category }); 

      console.log(`Recommendations:`, result.records.map(record => record.get('p').properties));
      return result.records.map(record => record.get('p').properties);
  } catch (error) {
      console.error('Error al obtener recomendaciones:', error);
      throw error;
  } finally {
      await session.close();
  }
}
async recommendRandomNoClicked(userId: string): Promise<any[]> { // recomienda 3 productos clickqueados en el carrito
  
  const session = this.driver.session();
  try {
     
      const clickedProductsResult = await session.run(`
      MATCH (u:User {id: $userId})-[:CLICKED_ON]->(clickedProduct:Product)
      WHERE clickedProduct.category = 'Clothes'
      RETURN clickedProduct.id AS clickedProductId
      `, 
      { userId });

      const clickedProductIds = clickedProductsResult.records.map(record => record.get('clickedProductId'));

     
      const unclickedProductsResult = await session.run(`
      MATCH (product:Product)
      WHERE product.category = 'Clothes' AND NOT product.id IN $clickedProductIds
      RETURN DISTINCT product
      `, 
      { clickedProductIds });

      let unclickedProducts = unclickedProductsResult.records.map(record => record.get('product').properties);

      
      let recommendedProducts = [];
      for (let i = 0; i < 3 && unclickedProducts.length > 0; i++) {
          let randomIndex = Math.floor(Math.random() * unclickedProducts.length);
          recommendedProducts.push(unclickedProducts[randomIndex]);
          unclickedProducts.splice(randomIndex, 1); 
      }

      console.log(`Recommendations:`, recommendedProducts);
      return recommendedProducts;
      
  } finally {
      await session.close();
  }
}







  
  }
  
  
  
  
  
  
  
 
  
  

  

