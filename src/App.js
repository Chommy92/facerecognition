import React, { Component } from 'react';
import Particles from 'react-particles-js';
import Navigation from './components/Navigation/Navigation';
import FaceRecognition from './components/FaceRecognition/FaceRecognition';
import Logo from './components/Logo/Logo';
import Register from './components/Register/Register';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import Rank from './components/Rank/Rank';
import SignIn from './components/SignIn/SignIn';
import 'tachyons';
import './App.css';



const initialState = {
         input:'',
         imageUrl:'',
         box: {},
         route: 'SignIn',
         isSignedIn: false,
         user:{
              id: '',
              name: '',
              email: '',
              entries: 0,
              joined: ''
         }
    }

class App extends Component {
  constructor(){
    super();
    this.state= initialState;
   
  }


  loadUser = (data) =>{
    this.setState({user:{
          id: data.id,
          name: data.name,
          email: data.email,
          entries: data.entries,
          joined: data.joined   
    }})
  }

// for small box on the face
  calculateFaceLocation = (data) =>{
   const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
   const image = document.getElementById('inputimage');
   const width = Number(image.width);
   const height = Number(image.height);
   return {
    leftCol: clarifaiFace.left_col * width,
    topRow: clarifaiFace.top_row * height,
    rightCol: width - (clarifaiFace.right_col * width),
    bottomRow: height -(clarifaiFace.bottom_row * height)
   }
  }

displayFaceBox = (box) =>{
  console.log(box);
  this.setState({box: box});
}

//for input
onInputChange =(event) =>{
this.setState({input: event.target.value});
}

//for face detection
onHandleSubmit =()=>{
  this.setState({imageUrl: this.state.input});
   fetch('https://warm-lowlands-14623.herokuapp.com/imageurl', {
      method: 'post',
      headers: {'content-Type': 'application/json'},
      body: JSON.stringify({
          input:this.state.input
        })
      })
     .then(response => response.json())
     .then(response => { 
        if(response){
          fetch('https://warm-lowlands-14623.herokuapp.com/image', {
          method: 'put',
          headers: {'content-Type': 'application/json'},
          body: JSON.stringify({
              id:this.state.user.id
            })
          })
          .then(response => response.json())
          .then(count =>{
            this.setState(Object.assign(this.state.user, {entries: count}))
          })

        }
    this.displayFaceBox(this.calculateFaceLocation(response))
  })
  
  .catch(err => console.log(err));  
  
}

//for signin
onRouteChange = (route) =>{
  if(route === 'signout'){
    this.setState(initialState)
  }else if(route === 'home'){
    this.setState({isSignedIn: true})
  }
  this.setState({route: route});
}

  render(){
  return (
    <div className="App">

          <Particles className='particles'
              params={{
                particles: {
                  number: {
                    value: 150,
                      
                        density: {
                          enable: true,
                          value_area: 800                    
                          }
                   
                  }
                }
              }}
          />
    
       <Navigation isSignedIn={this.state.isSignedIn} onRouteChange= {this.onRouteChange}/>
        {this.state.route === 'home'
             ? <div>
                  <Logo />
                   <Rank name={this.state.user.name} 
                   entries={this.state.user.entries}
                   />

                    <ImageLinkForm 
                    onInputChange={this.onInputChange} 
                    onHandleSubmit = {this.onHandleSubmit}
                    />
                    <FaceRecognition 
                    box ={this.state.box} 
                    imageUrl= {this.state.imageUrl}
                    />
                </div>
              : (
                  this.state.route === 'SignIn'
                  ? <SignIn loadUser={this.loadUser} 
                            onRouteChange = {this.onRouteChange}
                    />
                  : <Register loadUser={this.loadUser}
                              onRouteChange = {this.onRouteChange}
                    />
                )
                  
         }
    
    </div>
  );
 }
}

export default App;
