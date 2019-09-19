## Setup environment

### Install docsify 
``npm i docsify-cli -g``

### Preview your site
``docsify serve docs``

## Customize your site

You will modify this basic pages to get started. After that you'll start writing your doc

### index.html
* Change the <title></title> attribute with your workshop name
* In the window.$docsify initialization script , modify the name attribute for your workshop name

### _coverpage.md

This is the page that will be seen first. 

* Change the ``ABC Workshop`` for your own.
* Add a description
  
### _navbar.md

* Change the second link to the main documentation of the topic you are addressing
* Feel free to completely modify these links, don't add more than 3 if possible

### _sidebar.md

This is where the left sidebar content is written. You will revisit this page a lot during the creation of your workshop. A set of sample pages is attached

* Add and remove sections at will. 

Each section should have this format

``
- Excersise #1

  - [Do step C](2-excersice-1/1-stepC.md)
  - [Do step D](2-excersice-1/2-stepD.md)
``

### init.md
* Change the title
* Add a description and a architectural diagram if you want
