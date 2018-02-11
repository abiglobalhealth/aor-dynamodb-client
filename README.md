# aor-dynamodb-client

An [admin-on-rest](https://github.com/marmelab/admin-on-rest) client for [DynamoDb](https://aws.amazon.com/dynamodb/).


## Installation

```sh
npm install aor-dynamodb-client --save
```

## Usage

```js
// in src/App.js
import React from 'react';
import { Admin, Resource } from 'admin-on-rest';
import { PostList } from './posts';
import { restClient } from 'aor-dynamodb-client';

const awsConfig = { //optional
	region: 'us-east-1'
};

const tableConfig = {
	TableName:
}

const App = () => (
	<Admin restClient={restClient(tableConfig, awsConfig)} >
		<Resource name="posts" list={PostList} />
	</Admin>
);

export default App;

// in src/posts.js
import React from 'react';
import { List } from 'admin-on-rest';
import { Pagination } from 'aor-dynamodb-client';

export const PostList = (props) => (
	<List {...props} pagination={<Pagination />}>
		...
	</List>
);
```

## License

This library is licensed under the [MIT Licence](LICENSE).