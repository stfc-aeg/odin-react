# OdinApp
This should be a Top Level component within your app, encompassing the rest of the components as it's children.

It provides a navigation bar at the top, that will link to it's individual children. Please ensure each "page" child is contained within its own container component so that this navigation works correctly.

It also provides an Error Boundary, so that any errors from it's child components will cause an error message to be displayed on the page.

## Properties

- ### title (string):
    The title to display in the Navigation Bar
- ### navLinks (array of strings):
    A list of strings to display as the navigation buttons. Should match the number of children within the *OdinApp* element.

## Example

```jsx
import React from 'react'

import { OdinApp } from 'odin-react'

import 'odin-react/dist/index.css'

  <OdinApp title="Title" navLinks={["Page One", "Page Two", ...]}>
    <Container>Page One</Container>
    <Container>Page Two</Container>
    ...
  </OdinApp>
```