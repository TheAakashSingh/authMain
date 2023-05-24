import { AfterViewInit, Component } from '@angular/core';

declare var google: any;
declare var IN: any;
declare var FB: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {
  userDetails: any;

  constructor() { }

  ngAfterViewInit(): void {
    console.log('ngAfterViewInit executed');

    (window as any).onLinkedInLoad = () => {
      console.log("onLinkedInLoaded");

      IN.init({
        api_key: '779vqtbn3mp3ab',
        authorize: true,
        onLoad: 'onLinkedInLoad',
      });
      IN.Event.on(IN, 'auth', this.handleLinkedInAuth.bind(this)); 
    };

    google.accounts.id.initialize({
      client_id: "236025958894-l05tha7iovc0ool81upch4i6gi91npe8.apps.googleusercontent.com",
      callback: (response: any) => this.handleGoogleSignIn(response)
    });

    google.accounts.id.renderButton(
      document.getElementById("googleButtonDiv"),
      { size: "large", type: "icon", shape: "pill" } 
    );

    (window as any).fbAsyncInit = () => {
      FB.init({
        appId: '274786124893495',
        cookie: true,
        xfbml: true,
        version: 'v13.0'
      });
    };
  }

  handleLinkedInAuth(): void {
    if (IN.User.isAuthorized()) {
      IN.API.Profile("me")
        .fields("id", "first-name", "last-name", "email-address", "picture-url")
        .result((data: any) => {
          console.log('LinkedIn user details:', data.values[0]);
          this.userDetails = data.values[0];
        })
        .error((error: any) => {
          console.error('LinkedIn API error:', error);
        });
    } else {
      console.error('User is not authorized with LinkedIn');
    }
  }

  handleGoogleSignIn(response: any): void {
    console.log(response.credential);

    let base64Url = response.credential.split('.')[1];
    let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    let jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(function (c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join('')
    );
    this.userDetails = JSON.parse(jsonPayload);
  }

  handleFacebookSignIn(): void {
    FB.login((response: any) => {
      if (response.authResponse) {
        console.log('Facebook user details:', response.authResponse);
        FB.api('/me', { fields: 'id,first_name,last_name,email,picture' }, (userData: any) => {
          console.log('Facebook user data:', userData);
          this.userDetails = userData;
        });
      } else {
        console.error('User is not authorized with Facebook');
      }
    }, { scope: 'public_profile,email' });
  }
}
