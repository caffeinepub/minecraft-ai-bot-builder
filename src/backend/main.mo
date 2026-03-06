import List "mo:core/List";
import Text "mo:core/Text";
import Int "mo:core/Int";
import Map "mo:core/Map";
import Time "mo:core/Time";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Iter "mo:core/Iter";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  type Bot = {
    id : Nat;
    owner : Principal;
    name : Text;
    username : Text;
    behaviors : [Text];
    activityLevel : Text;
    chatPersonality : Text;
    movementStyle : Text;
    status : Text;
    serverHost : Text;
    serverPort : Nat;
    mcVersion : Text;
    createdAt : Int;
    notes : ?Text;
  };

  module Bot {
    public func compare(bot1 : Bot, bot2 : Bot) : Order.Order {
      Int.compare(bot1.createdAt, bot2.createdAt);
    };
  };

  public type UserProfile = {
    name : Text;
  };

  var nextId = 0;
  let bots = Map.empty<Nat, Bot>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public shared ({ caller }) func createBot(
    name : Text,
    username : Text,
    behaviors : [Text],
    activityLevel : Text,
    chatPersonality : Text,
    movementStyle : Text,
    serverHost : Text,
    serverPort : Nat,
    mcVersion : Text,
    notes : ?Text,
  ) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create bots");
    };

    let bot : Bot = {
      id = nextId;
      owner = caller;
      name;
      username;
      behaviors;
      activityLevel;
      chatPersonality;
      movementStyle;
      status = "idle";
      serverHost;
      serverPort;
      mcVersion;
      createdAt = Time.now();
      notes;
    };

    bots.add(nextId, bot);
    nextId += 1;
    bot.id;
  };

  public query ({ caller }) func getBots() : async [Bot] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get bots");
    };

    let userBots = bots.values().filter(
      func(bot) {
        bot.owner == caller;
      }
    );
    userBots.toArray().sort();
  };

  public query ({ caller }) func getBot(id : Nat) : async Bot {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get bots");
    };

    switch (bots.get(id)) {
      case (null) { Runtime.trap("Bot does not exist") };
      case (?bot) {
        if (bot.owner != caller) {
          Runtime.trap("Unauthorized: Can only access your own bots");
        };
        bot;
      };
    };
  };

  public shared ({ caller }) func updateBot(
    id : Nat,
    name : Text,
    username : Text,
    behaviors : [Text],
    activityLevel : Text,
    chatPersonality : Text,
    movementStyle : Text,
    serverHost : Text,
    serverPort : Nat,
    mcVersion : Text,
    notes : ?Text,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update bots");
    };

    switch (bots.get(id)) {
      case (null) { Runtime.trap("Bot does not exist") };
      case (?existingBot) {
        if (existingBot.owner != caller) {
          Runtime.trap("Unauthorized: Can only update your own bots");
        };

        let updatedBot : Bot = {
          id;
          owner = caller;
          name;
          username;
          behaviors;
          activityLevel;
          chatPersonality;
          movementStyle;
          status = existingBot.status;
          serverHost;
          serverPort;
          mcVersion;
          createdAt = existingBot.createdAt;
          notes;
        };
        bots.add(id, updatedBot);
      };
    };
  };

  public shared ({ caller }) func deleteBot(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete bots");
    };

    switch (bots.get(id)) {
      case (null) { Runtime.trap("Bot does not exist") };
      case (?bot) {
        if (bot.owner != caller) {
          Runtime.trap("Unauthorized: Can only delete your own bots");
        };
        bots.remove(id);
      };
    };
  };

  public shared ({ caller }) func setStatus(id : Nat, status : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can set bot status");
    };

    switch (bots.get(id)) {
      case (null) { Runtime.trap("Bot does not exist") };
      case (?bot) {
        if (bot.owner != caller) {
          Runtime.trap("Unauthorized: Can only update your own bots");
        };
        let updatedBot : Bot = {
          bot with status
        };
        bots.add(id, updatedBot);
      };
    };
  };
};
