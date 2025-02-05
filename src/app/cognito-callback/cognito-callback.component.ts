import { Component } from "@angular/core";
import { AppAuthService } from "../core/services";
import { ActivatedRoute, Router } from "@angular/router";

@Component({
  selector: "app-cognito-callback",
  templateUrl: "./cognito-callback.component.html",
  styleUrls: ["./cognito-callback.component.scss"],
})
export class CognitoCallbackComponent {
  constructor(
    private authService: AppAuthService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {
    // get AWS token and store in cognitoToken property in the Auth service
    this.activatedRoute.queryParams.subscribe((params) => {
      this.authService.setTokens(params["access_token"], params["id_token"]);
      this.authService.validateToken();
    });
  }
}
