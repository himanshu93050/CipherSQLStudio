// Programmatically generate 90 sample assignments (30 Easy, 30 Medium, 30 Hard)
const difficulties = Array.from({ length: 90 }, (_, i) => {
  const idx = i + 1;
  if (idx <= 30) return 'Easy';
  if (idx <= 60) return 'Medium';
  return 'Hard';
});

const commonTables = [
  {
    tableName: 'employees',
    columns: ['id', 'name', 'salary', 'dept_id']
  },
  {
    tableName: 'departments',
    columns: ['id', 'dept_name', 'location']
  },
  {
    tableName: 'orders',
    columns: ['id', 'customer_id', 'order_date', 'total']
  },
  {
    tableName: 'customers',
    columns: ['id', 'first_name', 'last_name', 'email']
  },
  {
    tableName: 'products',
    columns: ['id', 'name', 'price', 'category']
  }
];

const sampleData = [];

// A small set of realistic SQL problem templates to rotate through.
const templates = [
  {
    titleSuffix: 'List Departments',
    description: 'Return all departments with their id and name.',
    statement: (t1, t2) => `Return all departments from the ${t1.tableName} table showing department id and name. Order by id.`
  },
  {
    titleSuffix: 'Top Earners',
    description: 'Find employees with the highest salary in each department.',
    statement: (t1, t2) => `For each department, list the employee name and salary of the highest paid employee. Use ${t1.tableName} and ${t2.tableName} as needed.`
  },
  {
    titleSuffix: 'Customer Orders Total',
    description: 'Compute total order value per customer and show top 5 customers.',
    statement: (t1, t2) => `Compute the total order amount per customer from ${t1.tableName} and ${t2.tableName}, and return the top 5 customers by total spent.`
  },
  {
    titleSuffix: 'Products by Category',
    description: 'List products grouped by category with average price.',
    statement: (t1, t2) => `Group products in ${t1.tableName} by category and show category and average price, ordered by average price DESC.`
  },
  {
    titleSuffix: 'Recent Orders',
    description: 'Select the most recent orders placed in the last 30 days.',
    statement: (t1, t2) => `Return orders from ${t1.tableName} placed in the last 30 days, showing id, customer_id and total, ordered by order_date DESC.`
  },
  {
    titleSuffix: 'Join Customers and Orders',
    description: 'Join customers to their orders and show customer email with order totals.',
    statement: (t1, t2) => `Join ${t1.tableName} and ${t2.tableName} to show customer email and their order totals. Include customers with no orders.`
  }
];

for (let i = 1; i <= 90; i++) {
  const diff = difficulties[i - 1];
  const template = templates[(i - 1) % templates.length];
  const title = `Question ${i}: ${template.titleSuffix} (${diff})`;
  const description = `${template.description} This is a ${diff.toLowerCase()} level task.`;

  // Select 2 tables per question for variety
  const tables = [commonTables[i % commonTables.length], commonTables[(i + 1) % commonTables.length]];

  const problemStatement = template.statement(tables[0], tables[1]);

  const hintBase = {
    Easy: 'Think about simple SELECT and WHERE clauses.',
    Medium: 'Consider JOINs or aggregation (GROUP BY) where appropriate.',
    Hard: 'You may need subqueries, window functions, or multiple joins.'
  };

  sampleData.push({
    title,
    difficulty: diff,
    description,
    problemStatement,
    sampleInput: `-- Sample tables: ${tables.map(t => t.tableName).join(', ')}\n-- You can assume these tables contain realistic rows for the exercise.`,
    sampleOutput: `-- Example expected rows (first few):\n${(function(){
      if (tables[0].tableName === 'departments') return "id | dept_name\n1  | HR\n2  | Engineering";
      if (tables[0].tableName === 'employees') return "id | name | salary\n1  | Alice | 70000\n2  | Bob | 55000";
      if (tables[0].tableName === 'orders') return "id | customer_id | total\n1  | 1 | 100.00\n2  | 2 | 250.50";
      if (tables[0].tableName === 'customers') return "id | first_name | last_name\n1  | John | Doe\n2  | Jane | Smith";
      return "id | name | price\n1  | Widget | 9.99\n2  | Gadget | 19.95";
    })()}`,
    sampleData: tables,
    hintPrompt: hintBase[diff],
    tests: (function(){
      // basic keyword test per difficulty
      const base = diff === 'Easy'
        ? [ { type: 'mustContain', keywords: ['select'] } ]
        : diff === 'Medium'
          ? [ { type: 'mustContain', keywords: ['select', 'group by'] } ]
          : [ { type: 'mustContain', keywords: ['select', 'over'] } ];

      // maintain the same illustrative expectedResult tests for the first 5 questions
      if (i === 1) {
        base.push({
          type: 'expectedResult',
          expectedFields: ['id','dept_name'],
          expectedRows: [
            { id: 1, dept_name: 'HR' },
            { id: 2, dept_name: 'Engineering' }
          ]
        });
      }
      if (i === 2) {
        base.push({
          type: 'expectedResult',
          expectedFields: ['id','name'],
          expectedRows: [
            { id: 1, name: 'Alice' },
            { id: 2, name: 'Bob' }
          ]
        });
      }
      if (i === 3) {
        base.push({
          type: 'expectedResult',
          expectedFields: ['id','total'],
          expectedRows: [
            { id: 1, total: 100.0 },
            { id: 2, total: 250.5 }
          ]
        });
      }
      if (i === 4) {
        base.push({
          type: 'expectedResult',
          expectedFields: ['id','first_name'],
          expectedRows: [
            { id: 1, first_name: 'John' },
            { id: 2, first_name: 'Jane' }
          ]
        });
      }
      if (i === 5) {
        base.push({
          type: 'expectedResult',
          expectedFields: ['id','name','price'],
          expectedRows: [
            { id: 1, name: 'Widget', price: 9.99 },
            { id: 2, name: 'Gadget', price: 19.95 }
          ]
        });
      }

      return base;
    })()
  });
}

module.exports = sampleData;
