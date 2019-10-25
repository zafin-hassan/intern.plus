## Pages

#### GraphQL

GraphQL queries and their utilities are co-located with files that use them. Each page has a `/graphql` folder that holds both.

The utility functions are responsible for transforming data into a format that can be used across the application. This is necessary because the Apollo codegen tool that generates types for queries will generate a unique type for each query. A number of alternative options are possible to work with this:

1.  **Do some union type magic**: This approach is complicated and messy and hard to reason with.
2.  **Create a new wrapper component for every unique query**: Obviously not scalable. This also requires multiple changes every time the backend data schema changes.
3.  **Define a custom type that's agnostic to the data schema and transform data into that type**

The third approach is the one utilized here. Types like `IJobDetails` or `IResultCardItem` only worry about the shape and information provided by the fetched data. This offers a number of benefits:

- The utility function can be written alongside the queries. This means changes are easily made to both if they are needed.
- Additional transforms or logic can be done in the utility function. As a middle-man, the utility function is a logical place to perform additional calculations on fetched data if needed.
- Components, etc can be easily made reusable. Since the fetched data is now in a type that's common between all queries, all components, etc can use data from all fetched data, as long as the shape is correct.

#### Copy

For maintainability, copy is also kept largely separate from pages/components. It's more susceptible to change than the rest of the logic/styling, so it's good to place them in their own file (but keep them in the same directory) so changes are easier to make.