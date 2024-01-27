/*================================================================
 React Asynchronous Data
 
  Task: 
      It takes some time to load the sample data from the promise. 
  During this time, a user should be presented with a loading 
  indicator in its simplest form (e.g. text which says "Loading ..."). 
  Once the data arrived asynchronously, hide the loading indicator.
  
  Hints on how to accomplish this:
     - In order to show a loading indicator, one would need to introduce 
     a new stateful value. A boolean called isLoading may be the best solution.

     - When the side-effect which loads the data kicks in, set the stateful 
     boolean to true. Once the data loaded, set the stateful boolean to 
     false again.

     - In JSX, show a "Loading ..." text conditionally when the isLoading 
     boolean is set to true.

  Review what is useState?
      - When a state gets mutated, the component with the state 
      and all child components will re-render.

  Review what is useEffect?
    - What does useEffect do? by using this hook you tell React that 
     your component needs to do something after render.

=============================================*/

import * as React from 'react';

    /*
      At the moment initialStories is unstateful variable
      To gain control over the list, lets make it stateful.
      By using it as initial state in React's useState Hook. The 
      returned values from the array are the current state (stories) 
      and the state updater function (setStories):
    */
    const initialStories = [
    {
      title: 'React',
      url: 'https://reactjs.org/',
      author: 'Jordan Walke',
      num_comments: 3,
      points: 4,
      objectID: 0,
    },
    {
      title: 'Redux',
      url: 'https://redux.js.org/',
      author: 'Dan Abramov, Andrew Clark',
      num_comments: 2,
      points: 5,
      objectID: 1,
    },
  ]

  /* Fetching data. We start off with a function that returns a 
     promise with data in its shorthand version once it resolves. 
     Even though the data should arrive asynchronously when we start the 
     application, it appears to arrive synchronously, because it's rendered 
     immediately. Let's change this by giving it a bit of a realistic delay.
     When resolving the promise, delay it for 2 seconds:
   */
     const getAsyncStories = () =>
       new Promise((resolve) =>
       setTimeout(
         () => resolve({ data: { stories: initialStories } }),
         2000
       )
     );

  /* The following  is a custom hook that will store the state in a 
     local storage. useStorageState which will keep the component's 
     state in sync with the browser's local storage.

    This custom hook returns
      1. state 
      2. and a state updater function
    and accepts an initial state as argument. 

     This is the custom hook before it was refactored to make it generic:
     const [searchTerm, setSearchTerm] = React.useState(''); 
        1. searchTerm renamed to 'value'
        2. setSearchTerm renamed to 'setValue'
  */
  const useStorageState = (key, initialState) => {
     const [value, setValue] = React.useState(
        localStorage.getItem('key') || initialState 
     );
     
     React.useEffect(() => {
       console.log('useEffect fired. Displaying value of dependency array ' + [ value, key]  );
         localStorage.setItem(key, value);  
        },
        [value, key]   //Dependency array
        ); //EOF useEffect
    
     //the returned values are returned as an array.
     return [value, setValue]; 

  } //EOF create custom hook
  
 const App = () => { 
      /* 
      Call custom useStorageState hook to assign value to searchTerm, 
      setSearchTerm
      */
      const [searchTerm, setSearchTerm] =  useStorageState (
        'search', //key
        'React',  //Initial state
        );
      console.log('Value assigned to search term is = ' + searchTerm); 
      console.log('Value assigned tosetSearchTerm is = ' + setSearchTerm); 

      /* Step 1: Since we haven't fetch the data yet, initialize the state 
         'stories'with empty array and simulate fetching these stories async. */
      const [stories, setStories] = React.useState([]);

      /* Step 1.a: Add a new useEffect for the "stories" stateful value and 
      call the function and resolve the returned promise */
       React.useEffect(() => {
        //remember the first paramter to useEffect is a function
        getAsyncStories().then(result => {
          setStories(result.data.stories);
        });
      }, []); //remember second parameter is a dependency array

      /* Step 2: introduce another state called 'isLoading' and set the state 
        accordingly when data gets fetched. This is helpful when displaying wait icon. */
      const [isLoading, setIsLoading] = React.useState(false);

      /* Step 2a: Add a use effect for the isLoading stateful value */
      React.useEffect(() => {
        setIsLoading(true);
     
        getAsyncStories().then((result) => {
          setStories(result.data.stories);
          setIsLoading(false); //set the state that data has been loaded. We should
                               //ok now. What is missing is showing the loading indicator
        });
      }, []);

      /*Step 3: Introduce another state for error handling.Let's call it
        "isError" */
        const [isError, setIsError] = React.useState(false);

      /*Step 3a: Add a useEffect for'isError' */
        React.useEffect(() =>{
          setIsLoading(true);
          getAsyncStories()
            .then((result) => {
              setStories(result.data.stories);
              setIsLoading(false);
              })
            .catch(() => setIsError(true));
        }, []);


      /* Next we write event handler which removes an item from list
         Select the record from the state called 'stories' based on the filter
         Here, the JavaScript array's built-in filter method creates
         a new filtered array called 'story'.

          The filter() method takes a function as an argument, 
        which accesses each item in the array and returns /
        true or false. If the function returns true, meaning the condition is 
        met, the item stays in the newly created array; if the function 
        returns false, it's removed from the filtered array.

         Pass this handler to List component when instantiating the component
       
        */
      const handleRemoveStory = (item) => { 
        const newStories = stories.filter(   
          (story) => item.objectID !== story.objectID
        );
        //updater function updates the stateful variable 
        //called 'stories'. Since the state has changed
        //(e.g an item was deleted), the App, List, Item
        //components will re-render
        setStories(newStories);
      }

      const handleSearch = (event) => {
          setSearchTerm(event.target.value); 
        };

      const searchedStories = stories.filter((story) =>
        story.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
     
      return (
        <>
          <h1>My Hacker Stories</h1>
    
           <InputWithLabel
             id="search"
             value={searchTerm} //assign name of stateful value created by call to useState() hook
             isFocused //pass imperatively a dedicated  prop. isFocused as an attribute is equivalent to isFocused={true}
             onInputChange={handleSearch} //assign name of callback handler
            >
              <strong>Search with 2 sec delay:</strong> 
            
           </InputWithLabel>
         
          <hr />
          
          {isError && <p>Something went wrong ...</p>}
          
          {isLoading ? ( <p>Loading</p>) : 
            (<List list={searchedStories} onRemoveItem = {handleRemoveStory}/>) 
          }
        </>
         /*Using ternary operator isLoading ? we are rendering conditionally 
          a loading indicator or the List. But we need error handling. To do that
          introduce another state and handle it the promises */

         /*Next, give the user feedback in case something goes wrong with another 
          conditional rendering. This time, it's either rendering something or 
          nothing. So instead  of having a ternary operator where one side returns 
          null, use the logical && operator:
             {isError && <p>Something went wrong ...</p>}
          */
      );
    }
    
    const InputWithLabel = ({
       id,
       value,          //this prop was assigned {searchTerm}
       type = 'text',
       onInputChange, //this prop was assigned {handleSearch} the callback
       isFocused,
       children,
      }) => { 
        const inputRef = React.useRef();

        React.useEffect(() => {
          if (isFocused && inputRef.current) {
            inputRef.current.focus();
          }
        }, [isFocused]);

        return (
          <>
            <label htmlFor={id}>{children}</label>
            &nbsp;
            <input
              ref={inputRef}
              id={id}
              type={type}
              value={value}
              onChange={onInputChange}
            />
          </>
        );
    };
    
   /*
     Instantiate Item component. Pass three props:
       1. objectID 2. Item 3. onRemoveItem prop which was assigned 
          the callback handler 'handleRemoveStory'
     <Item key={item.objectID} item={item} onRemoveItem={onRemoveItem}
     
     Finally, the Item component uses the incoming callback handler 
     as a function in a new handler. In this handler, we will pass the 
     specific item to it. 
     
     Moreover, an additional button element is needed to trigger
     the actual event:

   */
   const List = ({list, onRemoveItem}) => ( 
    <ul>
       {list.map((item) => (
         <Item key={item.objectID} item={item} onRemoveItem={onRemoveItem} />
       ))}
    </ul>
  ); //EOF
     
 
  /*
   Finally, the Item component uses the incoming callback handler as a 
   function in a new handler. In this handler, we will pass the specific 
   item to it. Moreover, an additional button element is needed to trigger 
   the actual event:

   One popular solution is to use an inline arrow function, 
   which allows us to sneak in arguments like the item:
   <button type="button" onClick={() => onRemoveItem(item)}> 
        Dismiss
   </button>
 
  */
  const Item = ({item, onRemoveItem}) => (   
    <li>
      <span>
        <a href={item.url}>{item.title}</a>
      </span>
      <span>{item.author}</span>
      <span>{item.num_comments}</span>
      <span>{item.points}</span>
      <span>
       <button type="button" onClick={() => onRemoveItem(item)}>  
           Dismiss
       </button>
      </span>
    </li>
  );   

    
export default App;

//========================================================== 
//Note on Map:
 //Within the map() method, we have access to each object and its properties.
 
 //useState
 //By using useState, we are telling React that we want to have a 
 //stateful value which changes over time. And whenever this stateful value 
 //changes, the affected components (here: Search component) 
 //will re-render to use it (here: to display the recent value).

 /* 
     The filter() method takes a function 
        as an argument, which accesses each item in the array and returns /
        true or false. If the function returns true, meaning the condition is 
        met, the item stays in the newly created array; if the function 
        returns false, it's removed from the filtered array.

  
 */
 
 /*Note on Map:
   Within the map() method, we have access to each object and its properties.

 // concatenating variables into a string
    var fullName = `${firstName} ${lastName}`
    console.log(fullName);


 //useState
    By using useState, we are telling React that we want to have a 
 stateful value which changes over time. And whenever this stateful value 
 changes, the affected components (here: Search component) 
 will re-render to use it (here: to display the recent value).

  //Work flow of a useState:
       When the user types into the input field, the input field's change event 
      runs into the event handler. The handler's logic uses the event's value 
      of the target and the state updater function to set the updated state. 
      Afterward, the component re-renders (read: the component function runs). 
      The updated state becomes the current state (here: searchTerm) and is 
      displayed in the component's JSX.

  //Arrow Function
  function getTitle(title) { - convert to arrow function
  Eliminate "return" statement and enclosing bracket - concise
   const getTitle =(title) => 
   (
    title
    );

 //Arrow function - 
   Eliminate "return" statement and enclosing bracket if no business 
   business logic. Otherwise retain the {} and put a "return" statement - block
     const App = () => {} 
 
 */
      