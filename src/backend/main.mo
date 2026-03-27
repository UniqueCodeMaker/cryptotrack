import Iter "mo:core/Iter";
import Array "mo:core/Array";
import Time "mo:core/Time";
import Text "mo:core/Text";
import Map "mo:core/Map";
import Int "mo:core/Int";
import Nat "mo:core/Nat";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Float "mo:core/Float";
import Principal "mo:core/Principal";
import OutCall "http-outcalls/outcall";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  // Types
  type UserId = Principal;
  type HoldingId = Nat;
  type TransactionId = Nat;

  module Holding {
    public func compare(h1 : Holding, h2 : Holding) : Order.Order {
      Nat.compare(h1.id, h2.id);
    };
  };
  type Holding = {
    id : HoldingId;
    userId : UserId;
    symbol : Text;
    name : Text;
    quantity : Float;
    costBasis : Float;
    walletAddressLabel : Text;
    createdAt : Int;
    updatedAt : Int;
  };

  module HoldingDTO {
    public func compare(dto1 : HoldingDTO, dto2 : HoldingDTO) : Order.Order {
      Nat.compare(dto1.id, dto2.id);
    };
  };
  type HoldingDTO = {
    id : HoldingId;
    symbol : Text;
    name : Text;
    quantity : Float;
    costBasis : Float;
    walletAddressLabel : Text;
    createdAt : Int;
    updatedAt : Int;
  };

  module Transaction {
    public func compare(t1 : Transaction, t2 : Transaction) : Order.Order {
      Nat.compare(t1.id, t2.id);
    };
  };
  type Transaction = {
    id : TransactionId;
    userId : UserId;
    symbol : Text;
    transactionType : { #buy; #sell };
    quantity : Float;
    priceAtTime : Float;
    totalValue : Float;
    date : Int;
    notes : Text;
  };

  module TransactionDTO {
    public func compare(dto1 : TransactionDTO, dto2 : TransactionDTO) : Order.Order {
      Nat.compare(dto1.id, dto2.id);
    };
  };
  type TransactionDTO = {
    id : TransactionId;
    symbol : Text;
    transactionType : { #buy; #sell };
    quantity : Float;
    priceAtTime : Float;
    totalValue : Float;
    date : Int;
    notes : Text;
  };

  type ReferralStats = {
    referralCount : Nat;
    referredUsers : [Text];
  };

  module ReferralLeaderboardEntry {
    public func compare(e1 : ReferralLeaderboardEntry, e2 : ReferralLeaderboardEntry) : Order.Order {
      switch (Nat.compare(e2.referralCount, e1.referralCount)) {
        case (#equal) { Text.compare(e1.username, e2.username) };
        case (order) { order };
      };
    };
  };
  type ReferralLeaderboardEntry = {
    username : Text;
    referralCount : Nat;
  };

  module PlatformStats {
    public func compare(s1 : PlatformStats, s2 : PlatformStats) : Order.Order {
      Nat.compare(s1.totalUsers, s2.totalUsers);
    };
  };
  type PlatformStats = {
    totalUsers : Nat;
    activeUsers : Nat;
    suspendedUsers : Nat;
    totalHoldings : Nat;
    totalTransactions : Nat;
  };

  public type UserProfile = {
    name : Text;
  };

  // Authorization
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Data Storage
  let holdings = Map.empty<HoldingId, Holding>();
  let transactions = Map.empty<TransactionId, Transaction>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  var nextHoldingId : Nat = 1;
  var nextTransactionId : Nat = 1;

  // Price Data Caching
  var cachedPrices : Text = "";
  var lastPriceFetch : Int = 0;

  // Helper Functions
  func getNextHoldingId() : Nat {
    let id = nextHoldingId;
    nextHoldingId += 1;
    id;
  };

  func getNextTransactionId() : Nat {
    let id = nextTransactionId;
    nextTransactionId += 1;
    id;
  };

  func toHoldingDTO(holding : Holding) : HoldingDTO {
    {
      id = holding.id;
      symbol = holding.symbol;
      name = holding.name;
      quantity = holding.quantity;
      costBasis = holding.costBasis;
      walletAddressLabel = holding.walletAddressLabel;
      createdAt = holding.createdAt;
      updatedAt = holding.updatedAt;
    };
  };

  func toTransactionDTO(transaction : Transaction) : TransactionDTO {
    {
      id = transaction.id;
      symbol = transaction.symbol;
      transactionType = transaction.transactionType;
      quantity = transaction.quantity;
      priceAtTime = transaction.priceAtTime;
      totalValue = transaction.totalValue;
      date = transaction.date;
      notes = transaction.notes;
    };
  };

  // HTTP Transform Function
  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  // User Profile Functions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
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

  // Portfolio Holdings
  public shared ({ caller }) func addHolding(symbol : Text, name : Text, quantity : Float, costBasis : Float, walletAddressLabel : Text) : async HoldingId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add holdings");
    };
    let holdingId = getNextHoldingId();
    let holding : Holding = {
      id = holdingId;
      userId = caller;
      symbol;
      name;
      quantity;
      costBasis;
      walletAddressLabel;
      createdAt = Time.now();
      updatedAt = Time.now();
    };
    holdings.add(holdingId, holding);
    holdingId;
  };

  public shared ({ caller }) func updateHolding(holdingId : HoldingId, symbol : Text, name : Text, quantity : Float, costBasis : Float, walletAddressLabel : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update holdings");
    };
    switch (holdings.get(holdingId)) {
      case (?existingHolding) {
        if (existingHolding.userId != caller) {
          Runtime.trap("Unauthorized: Cannot update holding. You do not own this holding.");
        };

        let updatedHolding : Holding = {
          existingHolding with
          symbol;
          name;
          quantity;
          costBasis;
          walletAddressLabel;
          updatedAt = Time.now();
        };
        holdings.add(holdingId, updatedHolding);
      };
      case (null) {
        Runtime.trap("Holding not found or unauthorized");
      };
    };
  };

  public shared ({ caller }) func removeHolding(holdingId : HoldingId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can remove holdings");
    };
    switch (holdings.get(holdingId)) {
      case (?holding) {
        if (holding.userId != caller) {
          Runtime.trap("Unauthorized: Cannot remove holding. You do not own this holding.");
        };
        holdings.remove(holdingId);
      };
      case (null) {
        Runtime.trap("Holding not found or unauthorized");
      };
    };
  };

  public shared ({ caller }) func getUserHoldings(userId : UserId) : async [HoldingDTO] {
    if (not (AccessControl.isAdmin(accessControlState, caller) or caller == userId)) {
      Runtime.trap("Unauthorized: Cannot view holdings. You can only view your own holdings or you must be an admin.");
    };
    holdings.values().toArray().filter(
      func(h) { h.userId == userId }
    ).map(
      func(h) { toHoldingDTO(h) }
    ).sort();
  };

  // Transaction Log
  public shared ({ caller }) func addTransaction(symbol : Text, transactionType : { #buy; #sell }, quantity : Float, priceAtTime : Float, totalValue : Float, notes : Text) : async TransactionId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add transactions");
    };
    let transactionId = getNextTransactionId();
    let transaction : Transaction = {
      id = transactionId;
      userId = caller;
      symbol;
      transactionType;
      quantity;
      priceAtTime;
      totalValue;
      date = Time.now();
      notes;
    };
    transactions.add(transactionId, transaction);
    transactionId;
  };

  public shared ({ caller }) func getUserTransactions(userId : UserId) : async [TransactionDTO] {
    if (not (AccessControl.isAdmin(accessControlState, caller) or caller == userId)) {
      Runtime.trap("Unauthorized: Cannot view transactions. You can only view your own transactions or you must be an admin.");
    };
    transactions.values().toArray().filter(
      func(t) { t.userId == userId }
    ).map(
      func(t) { toTransactionDTO(t) }
    ).sort();
  };

  public shared ({ caller }) func deleteTransaction(transactionId : TransactionId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete transactions");
    };
    switch (transactions.get(transactionId)) {
      case (?transaction) {
        if (transaction.userId != caller) {
          Runtime.trap("Unauthorized: Cannot delete transaction. You do not own this transaction.");
        };
        transactions.remove(transactionId);
      };
      case (null) {
        Runtime.trap("Transaction not found or unauthorized");
      };
    };
  };

  // Live Price Data
  public shared ({ caller }) func getPrices() : async Text {
    let now = Time.now();
    if (now - lastPriceFetch < 60_000_000_000 and cachedPrices != "") {
      return cachedPrices;
    };

    let url = "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,binancecoin,solana,cardano,ripple,polkadot,dogecoin&vs_currencies=usd&include_24hr_change=true";
    let result = await OutCall.httpGetRequest(url, [], transform);
    cachedPrices := result;
    lastPriceFetch := now;
    result;
  };

  // Referral System
  public query ({ caller }) func getReferralStats(userId : UserId) : async ReferralStats {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view referral stats");
    };
    if (caller != userId and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own referral stats or you must be an admin");
    };
    return {
      referralCount = 0;
      referredUsers = [];
    };
  };

  public query ({ caller }) func getReferralLeaderboard() : async [ReferralLeaderboardEntry] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view referral leaderboard");
    };
    [].sort(ReferralLeaderboardEntry.compare);
  };

  // Admin Panel
  public shared ({ caller }) func getPlatformStats() : async PlatformStats {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view platform stats");
    };
    {
      totalUsers = 0;
      activeUsers = 0;
      suspendedUsers = 0;
      totalHoldings = holdings.size();
      totalTransactions = transactions.size();
    };
  };
};
