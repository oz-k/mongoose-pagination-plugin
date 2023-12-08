# Mongoose Pagination Plugin

## Installation
```bash
npm install @a-part/mongoose-pagination-plugin
```
or
```bash
yarn add @a-part/mongoose-pagination-plugin
```

## Usage
```javascript
const { mongoosePaginationPlugin } = require('@a-part/mongoose-pagination-plugin');

// Register a plugin for all schemas
mongoose.plugin(mongoosePaginationPlugin);

// Register a plugin for a specific schema
const schema = new Schema({ /* ... */ });
schema.plugin(mongoosePaginationPlugin);

// Example
const model = mongoose.model('Model', schema);

// Offset Based pagination
model.offsetPagination({
  paginationOption: {
    page: 1,
    limit: 10,
  },
  filterQueries: [
    {$match: {name: 'John', age: 20}},
    // more queries...
  ],
});

// Cursor Based pagination
model.cursorPagination({
  paginationOption: {
    skipCursor: true,
    limit: 10,
    paginationField: 'createdAt',
    cursor: '2021-01-01T00:00:00.000Z',
  },
  filterQueries: [
    {$match: {name: 'John', age: 20}},
    // more queries...
  ],
});
```