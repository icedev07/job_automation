
/**
 * Client
**/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model User
 * 
 */
export type User = $Result.DefaultSelection<Prisma.$UserPayload>
/**
 * Model OneClickJob
 * 
 */
export type OneClickJob = $Result.DefaultSelection<Prisma.$OneClickJobPayload>
/**
 * Model Resume
 * 
 */
export type Resume = $Result.DefaultSelection<Prisma.$ResumePayload>
/**
 * Model JobApplication
 * 
 */
export type JobApplication = $Result.DefaultSelection<Prisma.$JobApplicationPayload>
/**
 * Model JobDescription
 * 
 */
export type JobDescription = $Result.DefaultSelection<Prisma.$JobDescriptionPayload>
/**
 * Model TailoredResume
 * 
 */
export type TailoredResume = $Result.DefaultSelection<Prisma.$TailoredResumePayload>
/**
 * Model CoverLetter
 * 
 */
export type CoverLetter = $Result.DefaultSelection<Prisma.$CoverLetterPayload>
/**
 * Model AppConfig
 * 
 */
export type AppConfig = $Result.DefaultSelection<Prisma.$AppConfigPayload>
/**
 * Model SkipRule
 * 
 */
export type SkipRule = $Result.DefaultSelection<Prisma.$SkipRulePayload>
/**
 * Model UserProfile
 * 
 */
export type UserProfile = $Result.DefaultSelection<Prisma.$UserProfilePayload>
/**
 * Model ScanLog
 * 
 */
export type ScanLog = $Result.DefaultSelection<Prisma.$ScanLogPayload>
/**
 * Model GenerationLog
 * 
 */
export type GenerationLog = $Result.DefaultSelection<Prisma.$GenerationLogPayload>

/**
 * Enums
 */
export namespace $Enums {
  export const JobType: {
  REMOTE: 'REMOTE',
  HYBRID: 'HYBRID',
  ONSITE: 'ONSITE'
};

export type JobType = (typeof JobType)[keyof typeof JobType]


export const ApplicationStatus: {
  SAVED: 'SAVED',
  READY_TO_APPLY: 'READY_TO_APPLY',
  APPLIED: 'APPLIED',
  INTERVIEW: 'INTERVIEW',
  OFFER: 'OFFER',
  REJECTED: 'REJECTED',
  WITHDRAWN: 'WITHDRAWN'
};

export type ApplicationStatus = (typeof ApplicationStatus)[keyof typeof ApplicationStatus]


export const SkipRuleType: {
  TITLE: 'TITLE',
  COMPANY: 'COMPANY',
  URL: 'URL'
};

export type SkipRuleType = (typeof SkipRuleType)[keyof typeof SkipRuleType]

}

export type JobType = $Enums.JobType

export const JobType: typeof $Enums.JobType

export type ApplicationStatus = $Enums.ApplicationStatus

export const ApplicationStatus: typeof $Enums.ApplicationStatus

export type SkipRuleType = $Enums.SkipRuleType

export const SkipRuleType: typeof $Enums.SkipRuleType

/**
 * ##  Prisma Client ʲˢ
 * 
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Users
 * const users = await prisma.user.findMany()
 * ```
 *
 * 
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   * 
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more Users
   * const users = await prisma.user.findMany()
   * ```
   *
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): void;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

  /**
   * Add a middleware
   * @deprecated since 4.16.0. For new code, prefer client extensions instead.
   * @see https://pris.ly/d/extensions
   */
  $use(cb: Prisma.Middleware): void

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>


  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb, ExtArgs>

      /**
   * `prisma.user`: Exposes CRUD operations for the **User** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Users
    * const users = await prisma.user.findMany()
    * ```
    */
  get user(): Prisma.UserDelegate<ExtArgs>;

  /**
   * `prisma.oneClickJob`: Exposes CRUD operations for the **OneClickJob** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more OneClickJobs
    * const oneClickJobs = await prisma.oneClickJob.findMany()
    * ```
    */
  get oneClickJob(): Prisma.OneClickJobDelegate<ExtArgs>;

  /**
   * `prisma.resume`: Exposes CRUD operations for the **Resume** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Resumes
    * const resumes = await prisma.resume.findMany()
    * ```
    */
  get resume(): Prisma.ResumeDelegate<ExtArgs>;

  /**
   * `prisma.jobApplication`: Exposes CRUD operations for the **JobApplication** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more JobApplications
    * const jobApplications = await prisma.jobApplication.findMany()
    * ```
    */
  get jobApplication(): Prisma.JobApplicationDelegate<ExtArgs>;

  /**
   * `prisma.jobDescription`: Exposes CRUD operations for the **JobDescription** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more JobDescriptions
    * const jobDescriptions = await prisma.jobDescription.findMany()
    * ```
    */
  get jobDescription(): Prisma.JobDescriptionDelegate<ExtArgs>;

  /**
   * `prisma.tailoredResume`: Exposes CRUD operations for the **TailoredResume** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more TailoredResumes
    * const tailoredResumes = await prisma.tailoredResume.findMany()
    * ```
    */
  get tailoredResume(): Prisma.TailoredResumeDelegate<ExtArgs>;

  /**
   * `prisma.coverLetter`: Exposes CRUD operations for the **CoverLetter** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more CoverLetters
    * const coverLetters = await prisma.coverLetter.findMany()
    * ```
    */
  get coverLetter(): Prisma.CoverLetterDelegate<ExtArgs>;

  /**
   * `prisma.appConfig`: Exposes CRUD operations for the **AppConfig** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more AppConfigs
    * const appConfigs = await prisma.appConfig.findMany()
    * ```
    */
  get appConfig(): Prisma.AppConfigDelegate<ExtArgs>;

  /**
   * `prisma.skipRule`: Exposes CRUD operations for the **SkipRule** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more SkipRules
    * const skipRules = await prisma.skipRule.findMany()
    * ```
    */
  get skipRule(): Prisma.SkipRuleDelegate<ExtArgs>;

  /**
   * `prisma.userProfile`: Exposes CRUD operations for the **UserProfile** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more UserProfiles
    * const userProfiles = await prisma.userProfile.findMany()
    * ```
    */
  get userProfile(): Prisma.UserProfileDelegate<ExtArgs>;

  /**
   * `prisma.scanLog`: Exposes CRUD operations for the **ScanLog** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more ScanLogs
    * const scanLogs = await prisma.scanLog.findMany()
    * ```
    */
  get scanLog(): Prisma.ScanLogDelegate<ExtArgs>;

  /**
   * `prisma.generationLog`: Exposes CRUD operations for the **GenerationLog** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more GenerationLogs
    * const generationLogs = await prisma.generationLog.findMany()
    * ```
    */
  get generationLog(): Prisma.GenerationLogDelegate<ExtArgs>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError
  export import NotFoundError = runtime.NotFoundError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics 
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 5.22.0
   * Query Engine version: 605197351a3c8bdd595af2d2a9bc3025bca48ea2
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion 

  /**
   * Utility Types
   */


  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? K : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    User: 'User',
    OneClickJob: 'OneClickJob',
    Resume: 'Resume',
    JobApplication: 'JobApplication',
    JobDescription: 'JobDescription',
    TailoredResume: 'TailoredResume',
    CoverLetter: 'CoverLetter',
    AppConfig: 'AppConfig',
    SkipRule: 'SkipRule',
    UserProfile: 'UserProfile',
    ScanLog: 'ScanLog',
    GenerationLog: 'GenerationLog'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  interface TypeMapCb extends $Utils.Fn<{extArgs: $Extensions.InternalArgs, clientOptions: PrismaClientOptions }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], this['params']['clientOptions']>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, ClientOptions = {}> = {
    meta: {
      modelProps: "user" | "oneClickJob" | "resume" | "jobApplication" | "jobDescription" | "tailoredResume" | "coverLetter" | "appConfig" | "skipRule" | "userProfile" | "scanLog" | "generationLog"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      User: {
        payload: Prisma.$UserPayload<ExtArgs>
        fields: Prisma.UserFieldRefs
        operations: {
          findUnique: {
            args: Prisma.UserFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.UserFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findFirst: {
            args: Prisma.UserFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.UserFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findMany: {
            args: Prisma.UserFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          create: {
            args: Prisma.UserCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          createMany: {
            args: Prisma.UserCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.UserCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          delete: {
            args: Prisma.UserDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          update: {
            args: Prisma.UserUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          deleteMany: {
            args: Prisma.UserDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.UserUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.UserUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          aggregate: {
            args: Prisma.UserAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUser>
          }
          groupBy: {
            args: Prisma.UserGroupByArgs<ExtArgs>
            result: $Utils.Optional<UserGroupByOutputType>[]
          }
          count: {
            args: Prisma.UserCountArgs<ExtArgs>
            result: $Utils.Optional<UserCountAggregateOutputType> | number
          }
        }
      }
      OneClickJob: {
        payload: Prisma.$OneClickJobPayload<ExtArgs>
        fields: Prisma.OneClickJobFieldRefs
        operations: {
          findUnique: {
            args: Prisma.OneClickJobFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OneClickJobPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.OneClickJobFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OneClickJobPayload>
          }
          findFirst: {
            args: Prisma.OneClickJobFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OneClickJobPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.OneClickJobFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OneClickJobPayload>
          }
          findMany: {
            args: Prisma.OneClickJobFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OneClickJobPayload>[]
          }
          create: {
            args: Prisma.OneClickJobCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OneClickJobPayload>
          }
          createMany: {
            args: Prisma.OneClickJobCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.OneClickJobCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OneClickJobPayload>[]
          }
          delete: {
            args: Prisma.OneClickJobDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OneClickJobPayload>
          }
          update: {
            args: Prisma.OneClickJobUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OneClickJobPayload>
          }
          deleteMany: {
            args: Prisma.OneClickJobDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.OneClickJobUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.OneClickJobUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OneClickJobPayload>
          }
          aggregate: {
            args: Prisma.OneClickJobAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateOneClickJob>
          }
          groupBy: {
            args: Prisma.OneClickJobGroupByArgs<ExtArgs>
            result: $Utils.Optional<OneClickJobGroupByOutputType>[]
          }
          count: {
            args: Prisma.OneClickJobCountArgs<ExtArgs>
            result: $Utils.Optional<OneClickJobCountAggregateOutputType> | number
          }
        }
      }
      Resume: {
        payload: Prisma.$ResumePayload<ExtArgs>
        fields: Prisma.ResumeFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ResumeFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ResumePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ResumeFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ResumePayload>
          }
          findFirst: {
            args: Prisma.ResumeFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ResumePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ResumeFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ResumePayload>
          }
          findMany: {
            args: Prisma.ResumeFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ResumePayload>[]
          }
          create: {
            args: Prisma.ResumeCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ResumePayload>
          }
          createMany: {
            args: Prisma.ResumeCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ResumeCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ResumePayload>[]
          }
          delete: {
            args: Prisma.ResumeDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ResumePayload>
          }
          update: {
            args: Prisma.ResumeUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ResumePayload>
          }
          deleteMany: {
            args: Prisma.ResumeDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ResumeUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.ResumeUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ResumePayload>
          }
          aggregate: {
            args: Prisma.ResumeAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateResume>
          }
          groupBy: {
            args: Prisma.ResumeGroupByArgs<ExtArgs>
            result: $Utils.Optional<ResumeGroupByOutputType>[]
          }
          count: {
            args: Prisma.ResumeCountArgs<ExtArgs>
            result: $Utils.Optional<ResumeCountAggregateOutputType> | number
          }
        }
      }
      JobApplication: {
        payload: Prisma.$JobApplicationPayload<ExtArgs>
        fields: Prisma.JobApplicationFieldRefs
        operations: {
          findUnique: {
            args: Prisma.JobApplicationFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$JobApplicationPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.JobApplicationFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$JobApplicationPayload>
          }
          findFirst: {
            args: Prisma.JobApplicationFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$JobApplicationPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.JobApplicationFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$JobApplicationPayload>
          }
          findMany: {
            args: Prisma.JobApplicationFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$JobApplicationPayload>[]
          }
          create: {
            args: Prisma.JobApplicationCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$JobApplicationPayload>
          }
          createMany: {
            args: Prisma.JobApplicationCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.JobApplicationCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$JobApplicationPayload>[]
          }
          delete: {
            args: Prisma.JobApplicationDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$JobApplicationPayload>
          }
          update: {
            args: Prisma.JobApplicationUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$JobApplicationPayload>
          }
          deleteMany: {
            args: Prisma.JobApplicationDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.JobApplicationUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.JobApplicationUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$JobApplicationPayload>
          }
          aggregate: {
            args: Prisma.JobApplicationAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateJobApplication>
          }
          groupBy: {
            args: Prisma.JobApplicationGroupByArgs<ExtArgs>
            result: $Utils.Optional<JobApplicationGroupByOutputType>[]
          }
          count: {
            args: Prisma.JobApplicationCountArgs<ExtArgs>
            result: $Utils.Optional<JobApplicationCountAggregateOutputType> | number
          }
        }
      }
      JobDescription: {
        payload: Prisma.$JobDescriptionPayload<ExtArgs>
        fields: Prisma.JobDescriptionFieldRefs
        operations: {
          findUnique: {
            args: Prisma.JobDescriptionFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$JobDescriptionPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.JobDescriptionFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$JobDescriptionPayload>
          }
          findFirst: {
            args: Prisma.JobDescriptionFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$JobDescriptionPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.JobDescriptionFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$JobDescriptionPayload>
          }
          findMany: {
            args: Prisma.JobDescriptionFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$JobDescriptionPayload>[]
          }
          create: {
            args: Prisma.JobDescriptionCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$JobDescriptionPayload>
          }
          createMany: {
            args: Prisma.JobDescriptionCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.JobDescriptionCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$JobDescriptionPayload>[]
          }
          delete: {
            args: Prisma.JobDescriptionDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$JobDescriptionPayload>
          }
          update: {
            args: Prisma.JobDescriptionUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$JobDescriptionPayload>
          }
          deleteMany: {
            args: Prisma.JobDescriptionDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.JobDescriptionUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.JobDescriptionUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$JobDescriptionPayload>
          }
          aggregate: {
            args: Prisma.JobDescriptionAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateJobDescription>
          }
          groupBy: {
            args: Prisma.JobDescriptionGroupByArgs<ExtArgs>
            result: $Utils.Optional<JobDescriptionGroupByOutputType>[]
          }
          count: {
            args: Prisma.JobDescriptionCountArgs<ExtArgs>
            result: $Utils.Optional<JobDescriptionCountAggregateOutputType> | number
          }
        }
      }
      TailoredResume: {
        payload: Prisma.$TailoredResumePayload<ExtArgs>
        fields: Prisma.TailoredResumeFieldRefs
        operations: {
          findUnique: {
            args: Prisma.TailoredResumeFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TailoredResumePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.TailoredResumeFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TailoredResumePayload>
          }
          findFirst: {
            args: Prisma.TailoredResumeFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TailoredResumePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.TailoredResumeFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TailoredResumePayload>
          }
          findMany: {
            args: Prisma.TailoredResumeFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TailoredResumePayload>[]
          }
          create: {
            args: Prisma.TailoredResumeCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TailoredResumePayload>
          }
          createMany: {
            args: Prisma.TailoredResumeCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.TailoredResumeCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TailoredResumePayload>[]
          }
          delete: {
            args: Prisma.TailoredResumeDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TailoredResumePayload>
          }
          update: {
            args: Prisma.TailoredResumeUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TailoredResumePayload>
          }
          deleteMany: {
            args: Prisma.TailoredResumeDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.TailoredResumeUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.TailoredResumeUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TailoredResumePayload>
          }
          aggregate: {
            args: Prisma.TailoredResumeAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateTailoredResume>
          }
          groupBy: {
            args: Prisma.TailoredResumeGroupByArgs<ExtArgs>
            result: $Utils.Optional<TailoredResumeGroupByOutputType>[]
          }
          count: {
            args: Prisma.TailoredResumeCountArgs<ExtArgs>
            result: $Utils.Optional<TailoredResumeCountAggregateOutputType> | number
          }
        }
      }
      CoverLetter: {
        payload: Prisma.$CoverLetterPayload<ExtArgs>
        fields: Prisma.CoverLetterFieldRefs
        operations: {
          findUnique: {
            args: Prisma.CoverLetterFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CoverLetterPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.CoverLetterFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CoverLetterPayload>
          }
          findFirst: {
            args: Prisma.CoverLetterFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CoverLetterPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.CoverLetterFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CoverLetterPayload>
          }
          findMany: {
            args: Prisma.CoverLetterFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CoverLetterPayload>[]
          }
          create: {
            args: Prisma.CoverLetterCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CoverLetterPayload>
          }
          createMany: {
            args: Prisma.CoverLetterCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.CoverLetterCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CoverLetterPayload>[]
          }
          delete: {
            args: Prisma.CoverLetterDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CoverLetterPayload>
          }
          update: {
            args: Prisma.CoverLetterUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CoverLetterPayload>
          }
          deleteMany: {
            args: Prisma.CoverLetterDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.CoverLetterUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.CoverLetterUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CoverLetterPayload>
          }
          aggregate: {
            args: Prisma.CoverLetterAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateCoverLetter>
          }
          groupBy: {
            args: Prisma.CoverLetterGroupByArgs<ExtArgs>
            result: $Utils.Optional<CoverLetterGroupByOutputType>[]
          }
          count: {
            args: Prisma.CoverLetterCountArgs<ExtArgs>
            result: $Utils.Optional<CoverLetterCountAggregateOutputType> | number
          }
        }
      }
      AppConfig: {
        payload: Prisma.$AppConfigPayload<ExtArgs>
        fields: Prisma.AppConfigFieldRefs
        operations: {
          findUnique: {
            args: Prisma.AppConfigFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AppConfigPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.AppConfigFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AppConfigPayload>
          }
          findFirst: {
            args: Prisma.AppConfigFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AppConfigPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.AppConfigFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AppConfigPayload>
          }
          findMany: {
            args: Prisma.AppConfigFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AppConfigPayload>[]
          }
          create: {
            args: Prisma.AppConfigCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AppConfigPayload>
          }
          createMany: {
            args: Prisma.AppConfigCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.AppConfigCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AppConfigPayload>[]
          }
          delete: {
            args: Prisma.AppConfigDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AppConfigPayload>
          }
          update: {
            args: Prisma.AppConfigUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AppConfigPayload>
          }
          deleteMany: {
            args: Prisma.AppConfigDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.AppConfigUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.AppConfigUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AppConfigPayload>
          }
          aggregate: {
            args: Prisma.AppConfigAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateAppConfig>
          }
          groupBy: {
            args: Prisma.AppConfigGroupByArgs<ExtArgs>
            result: $Utils.Optional<AppConfigGroupByOutputType>[]
          }
          count: {
            args: Prisma.AppConfigCountArgs<ExtArgs>
            result: $Utils.Optional<AppConfigCountAggregateOutputType> | number
          }
        }
      }
      SkipRule: {
        payload: Prisma.$SkipRulePayload<ExtArgs>
        fields: Prisma.SkipRuleFieldRefs
        operations: {
          findUnique: {
            args: Prisma.SkipRuleFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SkipRulePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.SkipRuleFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SkipRulePayload>
          }
          findFirst: {
            args: Prisma.SkipRuleFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SkipRulePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.SkipRuleFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SkipRulePayload>
          }
          findMany: {
            args: Prisma.SkipRuleFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SkipRulePayload>[]
          }
          create: {
            args: Prisma.SkipRuleCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SkipRulePayload>
          }
          createMany: {
            args: Prisma.SkipRuleCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.SkipRuleCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SkipRulePayload>[]
          }
          delete: {
            args: Prisma.SkipRuleDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SkipRulePayload>
          }
          update: {
            args: Prisma.SkipRuleUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SkipRulePayload>
          }
          deleteMany: {
            args: Prisma.SkipRuleDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.SkipRuleUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.SkipRuleUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SkipRulePayload>
          }
          aggregate: {
            args: Prisma.SkipRuleAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateSkipRule>
          }
          groupBy: {
            args: Prisma.SkipRuleGroupByArgs<ExtArgs>
            result: $Utils.Optional<SkipRuleGroupByOutputType>[]
          }
          count: {
            args: Prisma.SkipRuleCountArgs<ExtArgs>
            result: $Utils.Optional<SkipRuleCountAggregateOutputType> | number
          }
        }
      }
      UserProfile: {
        payload: Prisma.$UserProfilePayload<ExtArgs>
        fields: Prisma.UserProfileFieldRefs
        operations: {
          findUnique: {
            args: Prisma.UserProfileFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserProfilePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.UserProfileFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserProfilePayload>
          }
          findFirst: {
            args: Prisma.UserProfileFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserProfilePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.UserProfileFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserProfilePayload>
          }
          findMany: {
            args: Prisma.UserProfileFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserProfilePayload>[]
          }
          create: {
            args: Prisma.UserProfileCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserProfilePayload>
          }
          createMany: {
            args: Prisma.UserProfileCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.UserProfileCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserProfilePayload>[]
          }
          delete: {
            args: Prisma.UserProfileDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserProfilePayload>
          }
          update: {
            args: Prisma.UserProfileUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserProfilePayload>
          }
          deleteMany: {
            args: Prisma.UserProfileDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.UserProfileUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.UserProfileUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserProfilePayload>
          }
          aggregate: {
            args: Prisma.UserProfileAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUserProfile>
          }
          groupBy: {
            args: Prisma.UserProfileGroupByArgs<ExtArgs>
            result: $Utils.Optional<UserProfileGroupByOutputType>[]
          }
          count: {
            args: Prisma.UserProfileCountArgs<ExtArgs>
            result: $Utils.Optional<UserProfileCountAggregateOutputType> | number
          }
        }
      }
      ScanLog: {
        payload: Prisma.$ScanLogPayload<ExtArgs>
        fields: Prisma.ScanLogFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ScanLogFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ScanLogPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ScanLogFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ScanLogPayload>
          }
          findFirst: {
            args: Prisma.ScanLogFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ScanLogPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ScanLogFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ScanLogPayload>
          }
          findMany: {
            args: Prisma.ScanLogFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ScanLogPayload>[]
          }
          create: {
            args: Prisma.ScanLogCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ScanLogPayload>
          }
          createMany: {
            args: Prisma.ScanLogCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ScanLogCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ScanLogPayload>[]
          }
          delete: {
            args: Prisma.ScanLogDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ScanLogPayload>
          }
          update: {
            args: Prisma.ScanLogUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ScanLogPayload>
          }
          deleteMany: {
            args: Prisma.ScanLogDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ScanLogUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.ScanLogUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ScanLogPayload>
          }
          aggregate: {
            args: Prisma.ScanLogAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateScanLog>
          }
          groupBy: {
            args: Prisma.ScanLogGroupByArgs<ExtArgs>
            result: $Utils.Optional<ScanLogGroupByOutputType>[]
          }
          count: {
            args: Prisma.ScanLogCountArgs<ExtArgs>
            result: $Utils.Optional<ScanLogCountAggregateOutputType> | number
          }
        }
      }
      GenerationLog: {
        payload: Prisma.$GenerationLogPayload<ExtArgs>
        fields: Prisma.GenerationLogFieldRefs
        operations: {
          findUnique: {
            args: Prisma.GenerationLogFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GenerationLogPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.GenerationLogFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GenerationLogPayload>
          }
          findFirst: {
            args: Prisma.GenerationLogFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GenerationLogPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.GenerationLogFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GenerationLogPayload>
          }
          findMany: {
            args: Prisma.GenerationLogFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GenerationLogPayload>[]
          }
          create: {
            args: Prisma.GenerationLogCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GenerationLogPayload>
          }
          createMany: {
            args: Prisma.GenerationLogCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.GenerationLogCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GenerationLogPayload>[]
          }
          delete: {
            args: Prisma.GenerationLogDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GenerationLogPayload>
          }
          update: {
            args: Prisma.GenerationLogUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GenerationLogPayload>
          }
          deleteMany: {
            args: Prisma.GenerationLogDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.GenerationLogUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.GenerationLogUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GenerationLogPayload>
          }
          aggregate: {
            args: Prisma.GenerationLogAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateGenerationLog>
          }
          groupBy: {
            args: Prisma.GenerationLogGroupByArgs<ExtArgs>
            result: $Utils.Optional<GenerationLogGroupByOutputType>[]
          }
          count: {
            args: Prisma.GenerationLogCountArgs<ExtArgs>
            result: $Utils.Optional<GenerationLogCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Defaults to stdout
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events
     * log: [
     *   { emit: 'stdout', level: 'query' },
     *   { emit: 'stdout', level: 'info' },
     *   { emit: 'stdout', level: 'warn' }
     *   { emit: 'stdout', level: 'error' }
     * ]
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
  }


  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type GetLogType<T extends LogLevel | LogDefinition> = T extends LogDefinition ? T['emit'] extends 'event' ? T['level'] : never : never
  export type GetEvents<T extends any> = T extends Array<LogLevel | LogDefinition> ?
    GetLogType<T[0]> | GetLogType<T[1]> | GetLogType<T[2]> | GetLogType<T[3]>
    : never

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  /**
   * These options are being passed into the middleware as "params"
   */
  export type MiddlewareParams = {
    model?: ModelName
    action: PrismaAction
    args: any
    dataPath: string[]
    runInTransaction: boolean
  }

  /**
   * The `T` type makes sure, that the `return proceed` is not forgotten in the middleware implementation
   */
  export type Middleware<T = any> = (
    params: MiddlewareParams,
    next: (params: MiddlewareParams) => $Utils.JsPromise<T>,
  ) => $Utils.JsPromise<T>

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type UserCountOutputType
   */

  export type UserCountOutputType = {
    resumes: number
    jobApplications: number
    oneClickJobs: number
  }

  export type UserCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    resumes?: boolean | UserCountOutputTypeCountResumesArgs
    jobApplications?: boolean | UserCountOutputTypeCountJobApplicationsArgs
    oneClickJobs?: boolean | UserCountOutputTypeCountOneClickJobsArgs
  }

  // Custom InputTypes
  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserCountOutputType
     */
    select?: UserCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountResumesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ResumeWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountJobApplicationsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: JobApplicationWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountOneClickJobsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: OneClickJobWhereInput
  }


  /**
   * Count Type ResumeCountOutputType
   */

  export type ResumeCountOutputType = {
    tailoredResumes: number
    coverLetters: number
  }

  export type ResumeCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    tailoredResumes?: boolean | ResumeCountOutputTypeCountTailoredResumesArgs
    coverLetters?: boolean | ResumeCountOutputTypeCountCoverLettersArgs
  }

  // Custom InputTypes
  /**
   * ResumeCountOutputType without action
   */
  export type ResumeCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ResumeCountOutputType
     */
    select?: ResumeCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * ResumeCountOutputType without action
   */
  export type ResumeCountOutputTypeCountTailoredResumesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TailoredResumeWhereInput
  }

  /**
   * ResumeCountOutputType without action
   */
  export type ResumeCountOutputTypeCountCoverLettersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CoverLetterWhereInput
  }


  /**
   * Count Type JobApplicationCountOutputType
   */

  export type JobApplicationCountOutputType = {
    tailoredResumes: number
    coverLetters: number
  }

  export type JobApplicationCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    tailoredResumes?: boolean | JobApplicationCountOutputTypeCountTailoredResumesArgs
    coverLetters?: boolean | JobApplicationCountOutputTypeCountCoverLettersArgs
  }

  // Custom InputTypes
  /**
   * JobApplicationCountOutputType without action
   */
  export type JobApplicationCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the JobApplicationCountOutputType
     */
    select?: JobApplicationCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * JobApplicationCountOutputType without action
   */
  export type JobApplicationCountOutputTypeCountTailoredResumesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TailoredResumeWhereInput
  }

  /**
   * JobApplicationCountOutputType without action
   */
  export type JobApplicationCountOutputTypeCountCoverLettersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CoverLetterWhereInput
  }


  /**
   * Models
   */

  /**
   * Model User
   */

  export type AggregateUser = {
    _count: UserCountAggregateOutputType | null
    _avg: UserAvgAggregateOutputType | null
    _sum: UserSumAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  export type UserAvgAggregateOutputType = {
    id: number | null
  }

  export type UserSumAggregateOutputType = {
    id: number | null
  }

  export type UserMinAggregateOutputType = {
    id: number | null
    email: string | null
    passwordHash: string | null
    createdAt: Date | null
  }

  export type UserMaxAggregateOutputType = {
    id: number | null
    email: string | null
    passwordHash: string | null
    createdAt: Date | null
  }

  export type UserCountAggregateOutputType = {
    id: number
    email: number
    passwordHash: number
    createdAt: number
    _all: number
  }


  export type UserAvgAggregateInputType = {
    id?: true
  }

  export type UserSumAggregateInputType = {
    id?: true
  }

  export type UserMinAggregateInputType = {
    id?: true
    email?: true
    passwordHash?: true
    createdAt?: true
  }

  export type UserMaxAggregateInputType = {
    id?: true
    email?: true
    passwordHash?: true
    createdAt?: true
  }

  export type UserCountAggregateInputType = {
    id?: true
    email?: true
    passwordHash?: true
    createdAt?: true
    _all?: true
  }

  export type UserAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which User to aggregate.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Users
    **/
    _count?: true | UserCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: UserAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: UserSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UserMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UserMaxAggregateInputType
  }

  export type GetUserAggregateType<T extends UserAggregateArgs> = {
        [P in keyof T & keyof AggregateUser]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUser[P]>
      : GetScalarType<T[P], AggregateUser[P]>
  }




  export type UserGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserWhereInput
    orderBy?: UserOrderByWithAggregationInput | UserOrderByWithAggregationInput[]
    by: UserScalarFieldEnum[] | UserScalarFieldEnum
    having?: UserScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UserCountAggregateInputType | true
    _avg?: UserAvgAggregateInputType
    _sum?: UserSumAggregateInputType
    _min?: UserMinAggregateInputType
    _max?: UserMaxAggregateInputType
  }

  export type UserGroupByOutputType = {
    id: number
    email: string
    passwordHash: string
    createdAt: Date
    _count: UserCountAggregateOutputType | null
    _avg: UserAvgAggregateOutputType | null
    _sum: UserSumAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  type GetUserGroupByPayload<T extends UserGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UserGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UserGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UserGroupByOutputType[P]>
            : GetScalarType<T[P], UserGroupByOutputType[P]>
        }
      >
    >


  export type UserSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    passwordHash?: boolean
    createdAt?: boolean
    resumes?: boolean | User$resumesArgs<ExtArgs>
    jobApplications?: boolean | User$jobApplicationsArgs<ExtArgs>
    oneClickJobs?: boolean | User$oneClickJobsArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["user"]>

  export type UserSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    passwordHash?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["user"]>

  export type UserSelectScalar = {
    id?: boolean
    email?: boolean
    passwordHash?: boolean
    createdAt?: boolean
  }

  export type UserInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    resumes?: boolean | User$resumesArgs<ExtArgs>
    jobApplications?: boolean | User$jobApplicationsArgs<ExtArgs>
    oneClickJobs?: boolean | User$oneClickJobsArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type UserIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $UserPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "User"
    objects: {
      resumes: Prisma.$ResumePayload<ExtArgs>[]
      jobApplications: Prisma.$JobApplicationPayload<ExtArgs>[]
      oneClickJobs: Prisma.$OneClickJobPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      email: string
      passwordHash: string
      createdAt: Date
    }, ExtArgs["result"]["user"]>
    composites: {}
  }

  type UserGetPayload<S extends boolean | null | undefined | UserDefaultArgs> = $Result.GetResult<Prisma.$UserPayload, S>

  type UserCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<UserFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: UserCountAggregateInputType | true
    }

  export interface UserDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['User'], meta: { name: 'User' } }
    /**
     * Find zero or one User that matches the filter.
     * @param {UserFindUniqueArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UserFindUniqueArgs>(args: SelectSubset<T, UserFindUniqueArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one User that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {UserFindUniqueOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UserFindUniqueOrThrowArgs>(args: SelectSubset<T, UserFindUniqueOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first User that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UserFindFirstArgs>(args?: SelectSubset<T, UserFindFirstArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first User that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UserFindFirstOrThrowArgs>(args?: SelectSubset<T, UserFindFirstOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Users that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Users
     * const users = await prisma.user.findMany()
     * 
     * // Get first 10 Users
     * const users = await prisma.user.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const userWithIdOnly = await prisma.user.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends UserFindManyArgs>(args?: SelectSubset<T, UserFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a User.
     * @param {UserCreateArgs} args - Arguments to create a User.
     * @example
     * // Create one User
     * const User = await prisma.user.create({
     *   data: {
     *     // ... data to create a User
     *   }
     * })
     * 
     */
    create<T extends UserCreateArgs>(args: SelectSubset<T, UserCreateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Users.
     * @param {UserCreateManyArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends UserCreateManyArgs>(args?: SelectSubset<T, UserCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Users and returns the data saved in the database.
     * @param {UserCreateManyAndReturnArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Users and only return the `id`
     * const userWithIdOnly = await prisma.user.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends UserCreateManyAndReturnArgs>(args?: SelectSubset<T, UserCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a User.
     * @param {UserDeleteArgs} args - Arguments to delete one User.
     * @example
     * // Delete one User
     * const User = await prisma.user.delete({
     *   where: {
     *     // ... filter to delete one User
     *   }
     * })
     * 
     */
    delete<T extends UserDeleteArgs>(args: SelectSubset<T, UserDeleteArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one User.
     * @param {UserUpdateArgs} args - Arguments to update one User.
     * @example
     * // Update one User
     * const user = await prisma.user.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends UserUpdateArgs>(args: SelectSubset<T, UserUpdateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Users.
     * @param {UserDeleteManyArgs} args - Arguments to filter Users to delete.
     * @example
     * // Delete a few Users
     * const { count } = await prisma.user.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends UserDeleteManyArgs>(args?: SelectSubset<T, UserDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends UserUpdateManyArgs>(args: SelectSubset<T, UserUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one User.
     * @param {UserUpsertArgs} args - Arguments to update or create a User.
     * @example
     * // Update or create a User
     * const user = await prisma.user.upsert({
     *   create: {
     *     // ... data to create a User
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the User we want to update
     *   }
     * })
     */
    upsert<T extends UserUpsertArgs>(args: SelectSubset<T, UserUpsertArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserCountArgs} args - Arguments to filter Users to count.
     * @example
     * // Count the number of Users
     * const count = await prisma.user.count({
     *   where: {
     *     // ... the filter for the Users we want to count
     *   }
     * })
    **/
    count<T extends UserCountArgs>(
      args?: Subset<T, UserCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UserCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends UserAggregateArgs>(args: Subset<T, UserAggregateArgs>): Prisma.PrismaPromise<GetUserAggregateType<T>>

    /**
     * Group by User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends UserGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UserGroupByArgs['orderBy'] }
        : { orderBy?: UserGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, UserGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUserGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the User model
   */
  readonly fields: UserFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for User.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UserClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    resumes<T extends User$resumesArgs<ExtArgs> = {}>(args?: Subset<T, User$resumesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ResumePayload<ExtArgs>, T, "findMany"> | Null>
    jobApplications<T extends User$jobApplicationsArgs<ExtArgs> = {}>(args?: Subset<T, User$jobApplicationsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$JobApplicationPayload<ExtArgs>, T, "findMany"> | Null>
    oneClickJobs<T extends User$oneClickJobsArgs<ExtArgs> = {}>(args?: Subset<T, User$oneClickJobsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OneClickJobPayload<ExtArgs>, T, "findMany"> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the User model
   */ 
  interface UserFieldRefs {
    readonly id: FieldRef<"User", 'Int'>
    readonly email: FieldRef<"User", 'String'>
    readonly passwordHash: FieldRef<"User", 'String'>
    readonly createdAt: FieldRef<"User", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * User findUnique
   */
  export type UserFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findUniqueOrThrow
   */
  export type UserFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findFirst
   */
  export type UserFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findFirstOrThrow
   */
  export type UserFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findMany
   */
  export type UserFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which Users to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User create
   */
  export type UserCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to create a User.
     */
    data: XOR<UserCreateInput, UserUncheckedCreateInput>
  }

  /**
   * User createMany
   */
  export type UserCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * User createManyAndReturn
   */
  export type UserCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * User update
   */
  export type UserUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to update a User.
     */
    data: XOR<UserUpdateInput, UserUncheckedUpdateInput>
    /**
     * Choose, which User to update.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User updateMany
   */
  export type UserUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput
  }

  /**
   * User upsert
   */
  export type UserUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The filter to search for the User to update in case it exists.
     */
    where: UserWhereUniqueInput
    /**
     * In case the User found by the `where` argument doesn't exist, create a new User with this data.
     */
    create: XOR<UserCreateInput, UserUncheckedCreateInput>
    /**
     * In case the User was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UserUpdateInput, UserUncheckedUpdateInput>
  }

  /**
   * User delete
   */
  export type UserDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter which User to delete.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User deleteMany
   */
  export type UserDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Users to delete
     */
    where?: UserWhereInput
  }

  /**
   * User.resumes
   */
  export type User$resumesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Resume
     */
    select?: ResumeSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ResumeInclude<ExtArgs> | null
    where?: ResumeWhereInput
    orderBy?: ResumeOrderByWithRelationInput | ResumeOrderByWithRelationInput[]
    cursor?: ResumeWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ResumeScalarFieldEnum | ResumeScalarFieldEnum[]
  }

  /**
   * User.jobApplications
   */
  export type User$jobApplicationsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the JobApplication
     */
    select?: JobApplicationSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: JobApplicationInclude<ExtArgs> | null
    where?: JobApplicationWhereInput
    orderBy?: JobApplicationOrderByWithRelationInput | JobApplicationOrderByWithRelationInput[]
    cursor?: JobApplicationWhereUniqueInput
    take?: number
    skip?: number
    distinct?: JobApplicationScalarFieldEnum | JobApplicationScalarFieldEnum[]
  }

  /**
   * User.oneClickJobs
   */
  export type User$oneClickJobsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OneClickJob
     */
    select?: OneClickJobSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OneClickJobInclude<ExtArgs> | null
    where?: OneClickJobWhereInput
    orderBy?: OneClickJobOrderByWithRelationInput | OneClickJobOrderByWithRelationInput[]
    cursor?: OneClickJobWhereUniqueInput
    take?: number
    skip?: number
    distinct?: OneClickJobScalarFieldEnum | OneClickJobScalarFieldEnum[]
  }

  /**
   * User without action
   */
  export type UserDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
  }


  /**
   * Model OneClickJob
   */

  export type AggregateOneClickJob = {
    _count: OneClickJobCountAggregateOutputType | null
    _avg: OneClickJobAvgAggregateOutputType | null
    _sum: OneClickJobSumAggregateOutputType | null
    _min: OneClickJobMinAggregateOutputType | null
    _max: OneClickJobMaxAggregateOutputType | null
  }

  export type OneClickJobAvgAggregateOutputType = {
    id: number | null
    userId: number | null
  }

  export type OneClickJobSumAggregateOutputType = {
    id: number | null
    userId: number | null
  }

  export type OneClickJobMinAggregateOutputType = {
    id: number | null
    userId: number | null
    source: string | null
    title: string | null
    company: string | null
    externalUrl: string | null
    fullText: string | null
    appliedAt: Date | null
    createdAt: Date | null
  }

  export type OneClickJobMaxAggregateOutputType = {
    id: number | null
    userId: number | null
    source: string | null
    title: string | null
    company: string | null
    externalUrl: string | null
    fullText: string | null
    appliedAt: Date | null
    createdAt: Date | null
  }

  export type OneClickJobCountAggregateOutputType = {
    id: number
    userId: number
    source: number
    title: number
    company: number
    externalUrl: number
    fullText: number
    appliedAt: number
    createdAt: number
    _all: number
  }


  export type OneClickJobAvgAggregateInputType = {
    id?: true
    userId?: true
  }

  export type OneClickJobSumAggregateInputType = {
    id?: true
    userId?: true
  }

  export type OneClickJobMinAggregateInputType = {
    id?: true
    userId?: true
    source?: true
    title?: true
    company?: true
    externalUrl?: true
    fullText?: true
    appliedAt?: true
    createdAt?: true
  }

  export type OneClickJobMaxAggregateInputType = {
    id?: true
    userId?: true
    source?: true
    title?: true
    company?: true
    externalUrl?: true
    fullText?: true
    appliedAt?: true
    createdAt?: true
  }

  export type OneClickJobCountAggregateInputType = {
    id?: true
    userId?: true
    source?: true
    title?: true
    company?: true
    externalUrl?: true
    fullText?: true
    appliedAt?: true
    createdAt?: true
    _all?: true
  }

  export type OneClickJobAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which OneClickJob to aggregate.
     */
    where?: OneClickJobWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OneClickJobs to fetch.
     */
    orderBy?: OneClickJobOrderByWithRelationInput | OneClickJobOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: OneClickJobWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OneClickJobs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OneClickJobs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned OneClickJobs
    **/
    _count?: true | OneClickJobCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: OneClickJobAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: OneClickJobSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: OneClickJobMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: OneClickJobMaxAggregateInputType
  }

  export type GetOneClickJobAggregateType<T extends OneClickJobAggregateArgs> = {
        [P in keyof T & keyof AggregateOneClickJob]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateOneClickJob[P]>
      : GetScalarType<T[P], AggregateOneClickJob[P]>
  }




  export type OneClickJobGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: OneClickJobWhereInput
    orderBy?: OneClickJobOrderByWithAggregationInput | OneClickJobOrderByWithAggregationInput[]
    by: OneClickJobScalarFieldEnum[] | OneClickJobScalarFieldEnum
    having?: OneClickJobScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: OneClickJobCountAggregateInputType | true
    _avg?: OneClickJobAvgAggregateInputType
    _sum?: OneClickJobSumAggregateInputType
    _min?: OneClickJobMinAggregateInputType
    _max?: OneClickJobMaxAggregateInputType
  }

  export type OneClickJobGroupByOutputType = {
    id: number
    userId: number
    source: string
    title: string
    company: string
    externalUrl: string
    fullText: string
    appliedAt: Date | null
    createdAt: Date
    _count: OneClickJobCountAggregateOutputType | null
    _avg: OneClickJobAvgAggregateOutputType | null
    _sum: OneClickJobSumAggregateOutputType | null
    _min: OneClickJobMinAggregateOutputType | null
    _max: OneClickJobMaxAggregateOutputType | null
  }

  type GetOneClickJobGroupByPayload<T extends OneClickJobGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<OneClickJobGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof OneClickJobGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], OneClickJobGroupByOutputType[P]>
            : GetScalarType<T[P], OneClickJobGroupByOutputType[P]>
        }
      >
    >


  export type OneClickJobSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    source?: boolean
    title?: boolean
    company?: boolean
    externalUrl?: boolean
    fullText?: boolean
    appliedAt?: boolean
    createdAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["oneClickJob"]>

  export type OneClickJobSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    source?: boolean
    title?: boolean
    company?: boolean
    externalUrl?: boolean
    fullText?: boolean
    appliedAt?: boolean
    createdAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["oneClickJob"]>

  export type OneClickJobSelectScalar = {
    id?: boolean
    userId?: boolean
    source?: boolean
    title?: boolean
    company?: boolean
    externalUrl?: boolean
    fullText?: boolean
    appliedAt?: boolean
    createdAt?: boolean
  }

  export type OneClickJobInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type OneClickJobIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $OneClickJobPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "OneClickJob"
    objects: {
      user: Prisma.$UserPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      userId: number
      source: string
      title: string
      company: string
      externalUrl: string
      fullText: string
      appliedAt: Date | null
      createdAt: Date
    }, ExtArgs["result"]["oneClickJob"]>
    composites: {}
  }

  type OneClickJobGetPayload<S extends boolean | null | undefined | OneClickJobDefaultArgs> = $Result.GetResult<Prisma.$OneClickJobPayload, S>

  type OneClickJobCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<OneClickJobFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: OneClickJobCountAggregateInputType | true
    }

  export interface OneClickJobDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['OneClickJob'], meta: { name: 'OneClickJob' } }
    /**
     * Find zero or one OneClickJob that matches the filter.
     * @param {OneClickJobFindUniqueArgs} args - Arguments to find a OneClickJob
     * @example
     * // Get one OneClickJob
     * const oneClickJob = await prisma.oneClickJob.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends OneClickJobFindUniqueArgs>(args: SelectSubset<T, OneClickJobFindUniqueArgs<ExtArgs>>): Prisma__OneClickJobClient<$Result.GetResult<Prisma.$OneClickJobPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one OneClickJob that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {OneClickJobFindUniqueOrThrowArgs} args - Arguments to find a OneClickJob
     * @example
     * // Get one OneClickJob
     * const oneClickJob = await prisma.oneClickJob.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends OneClickJobFindUniqueOrThrowArgs>(args: SelectSubset<T, OneClickJobFindUniqueOrThrowArgs<ExtArgs>>): Prisma__OneClickJobClient<$Result.GetResult<Prisma.$OneClickJobPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first OneClickJob that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OneClickJobFindFirstArgs} args - Arguments to find a OneClickJob
     * @example
     * // Get one OneClickJob
     * const oneClickJob = await prisma.oneClickJob.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends OneClickJobFindFirstArgs>(args?: SelectSubset<T, OneClickJobFindFirstArgs<ExtArgs>>): Prisma__OneClickJobClient<$Result.GetResult<Prisma.$OneClickJobPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first OneClickJob that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OneClickJobFindFirstOrThrowArgs} args - Arguments to find a OneClickJob
     * @example
     * // Get one OneClickJob
     * const oneClickJob = await prisma.oneClickJob.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends OneClickJobFindFirstOrThrowArgs>(args?: SelectSubset<T, OneClickJobFindFirstOrThrowArgs<ExtArgs>>): Prisma__OneClickJobClient<$Result.GetResult<Prisma.$OneClickJobPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more OneClickJobs that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OneClickJobFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all OneClickJobs
     * const oneClickJobs = await prisma.oneClickJob.findMany()
     * 
     * // Get first 10 OneClickJobs
     * const oneClickJobs = await prisma.oneClickJob.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const oneClickJobWithIdOnly = await prisma.oneClickJob.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends OneClickJobFindManyArgs>(args?: SelectSubset<T, OneClickJobFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OneClickJobPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a OneClickJob.
     * @param {OneClickJobCreateArgs} args - Arguments to create a OneClickJob.
     * @example
     * // Create one OneClickJob
     * const OneClickJob = await prisma.oneClickJob.create({
     *   data: {
     *     // ... data to create a OneClickJob
     *   }
     * })
     * 
     */
    create<T extends OneClickJobCreateArgs>(args: SelectSubset<T, OneClickJobCreateArgs<ExtArgs>>): Prisma__OneClickJobClient<$Result.GetResult<Prisma.$OneClickJobPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many OneClickJobs.
     * @param {OneClickJobCreateManyArgs} args - Arguments to create many OneClickJobs.
     * @example
     * // Create many OneClickJobs
     * const oneClickJob = await prisma.oneClickJob.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends OneClickJobCreateManyArgs>(args?: SelectSubset<T, OneClickJobCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many OneClickJobs and returns the data saved in the database.
     * @param {OneClickJobCreateManyAndReturnArgs} args - Arguments to create many OneClickJobs.
     * @example
     * // Create many OneClickJobs
     * const oneClickJob = await prisma.oneClickJob.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many OneClickJobs and only return the `id`
     * const oneClickJobWithIdOnly = await prisma.oneClickJob.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends OneClickJobCreateManyAndReturnArgs>(args?: SelectSubset<T, OneClickJobCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OneClickJobPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a OneClickJob.
     * @param {OneClickJobDeleteArgs} args - Arguments to delete one OneClickJob.
     * @example
     * // Delete one OneClickJob
     * const OneClickJob = await prisma.oneClickJob.delete({
     *   where: {
     *     // ... filter to delete one OneClickJob
     *   }
     * })
     * 
     */
    delete<T extends OneClickJobDeleteArgs>(args: SelectSubset<T, OneClickJobDeleteArgs<ExtArgs>>): Prisma__OneClickJobClient<$Result.GetResult<Prisma.$OneClickJobPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one OneClickJob.
     * @param {OneClickJobUpdateArgs} args - Arguments to update one OneClickJob.
     * @example
     * // Update one OneClickJob
     * const oneClickJob = await prisma.oneClickJob.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends OneClickJobUpdateArgs>(args: SelectSubset<T, OneClickJobUpdateArgs<ExtArgs>>): Prisma__OneClickJobClient<$Result.GetResult<Prisma.$OneClickJobPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more OneClickJobs.
     * @param {OneClickJobDeleteManyArgs} args - Arguments to filter OneClickJobs to delete.
     * @example
     * // Delete a few OneClickJobs
     * const { count } = await prisma.oneClickJob.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends OneClickJobDeleteManyArgs>(args?: SelectSubset<T, OneClickJobDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more OneClickJobs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OneClickJobUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many OneClickJobs
     * const oneClickJob = await prisma.oneClickJob.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends OneClickJobUpdateManyArgs>(args: SelectSubset<T, OneClickJobUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one OneClickJob.
     * @param {OneClickJobUpsertArgs} args - Arguments to update or create a OneClickJob.
     * @example
     * // Update or create a OneClickJob
     * const oneClickJob = await prisma.oneClickJob.upsert({
     *   create: {
     *     // ... data to create a OneClickJob
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the OneClickJob we want to update
     *   }
     * })
     */
    upsert<T extends OneClickJobUpsertArgs>(args: SelectSubset<T, OneClickJobUpsertArgs<ExtArgs>>): Prisma__OneClickJobClient<$Result.GetResult<Prisma.$OneClickJobPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of OneClickJobs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OneClickJobCountArgs} args - Arguments to filter OneClickJobs to count.
     * @example
     * // Count the number of OneClickJobs
     * const count = await prisma.oneClickJob.count({
     *   where: {
     *     // ... the filter for the OneClickJobs we want to count
     *   }
     * })
    **/
    count<T extends OneClickJobCountArgs>(
      args?: Subset<T, OneClickJobCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], OneClickJobCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a OneClickJob.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OneClickJobAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends OneClickJobAggregateArgs>(args: Subset<T, OneClickJobAggregateArgs>): Prisma.PrismaPromise<GetOneClickJobAggregateType<T>>

    /**
     * Group by OneClickJob.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OneClickJobGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends OneClickJobGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: OneClickJobGroupByArgs['orderBy'] }
        : { orderBy?: OneClickJobGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, OneClickJobGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetOneClickJobGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the OneClickJob model
   */
  readonly fields: OneClickJobFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for OneClickJob.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__OneClickJobClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the OneClickJob model
   */ 
  interface OneClickJobFieldRefs {
    readonly id: FieldRef<"OneClickJob", 'Int'>
    readonly userId: FieldRef<"OneClickJob", 'Int'>
    readonly source: FieldRef<"OneClickJob", 'String'>
    readonly title: FieldRef<"OneClickJob", 'String'>
    readonly company: FieldRef<"OneClickJob", 'String'>
    readonly externalUrl: FieldRef<"OneClickJob", 'String'>
    readonly fullText: FieldRef<"OneClickJob", 'String'>
    readonly appliedAt: FieldRef<"OneClickJob", 'DateTime'>
    readonly createdAt: FieldRef<"OneClickJob", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * OneClickJob findUnique
   */
  export type OneClickJobFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OneClickJob
     */
    select?: OneClickJobSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OneClickJobInclude<ExtArgs> | null
    /**
     * Filter, which OneClickJob to fetch.
     */
    where: OneClickJobWhereUniqueInput
  }

  /**
   * OneClickJob findUniqueOrThrow
   */
  export type OneClickJobFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OneClickJob
     */
    select?: OneClickJobSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OneClickJobInclude<ExtArgs> | null
    /**
     * Filter, which OneClickJob to fetch.
     */
    where: OneClickJobWhereUniqueInput
  }

  /**
   * OneClickJob findFirst
   */
  export type OneClickJobFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OneClickJob
     */
    select?: OneClickJobSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OneClickJobInclude<ExtArgs> | null
    /**
     * Filter, which OneClickJob to fetch.
     */
    where?: OneClickJobWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OneClickJobs to fetch.
     */
    orderBy?: OneClickJobOrderByWithRelationInput | OneClickJobOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for OneClickJobs.
     */
    cursor?: OneClickJobWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OneClickJobs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OneClickJobs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of OneClickJobs.
     */
    distinct?: OneClickJobScalarFieldEnum | OneClickJobScalarFieldEnum[]
  }

  /**
   * OneClickJob findFirstOrThrow
   */
  export type OneClickJobFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OneClickJob
     */
    select?: OneClickJobSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OneClickJobInclude<ExtArgs> | null
    /**
     * Filter, which OneClickJob to fetch.
     */
    where?: OneClickJobWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OneClickJobs to fetch.
     */
    orderBy?: OneClickJobOrderByWithRelationInput | OneClickJobOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for OneClickJobs.
     */
    cursor?: OneClickJobWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OneClickJobs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OneClickJobs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of OneClickJobs.
     */
    distinct?: OneClickJobScalarFieldEnum | OneClickJobScalarFieldEnum[]
  }

  /**
   * OneClickJob findMany
   */
  export type OneClickJobFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OneClickJob
     */
    select?: OneClickJobSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OneClickJobInclude<ExtArgs> | null
    /**
     * Filter, which OneClickJobs to fetch.
     */
    where?: OneClickJobWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OneClickJobs to fetch.
     */
    orderBy?: OneClickJobOrderByWithRelationInput | OneClickJobOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing OneClickJobs.
     */
    cursor?: OneClickJobWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OneClickJobs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OneClickJobs.
     */
    skip?: number
    distinct?: OneClickJobScalarFieldEnum | OneClickJobScalarFieldEnum[]
  }

  /**
   * OneClickJob create
   */
  export type OneClickJobCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OneClickJob
     */
    select?: OneClickJobSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OneClickJobInclude<ExtArgs> | null
    /**
     * The data needed to create a OneClickJob.
     */
    data: XOR<OneClickJobCreateInput, OneClickJobUncheckedCreateInput>
  }

  /**
   * OneClickJob createMany
   */
  export type OneClickJobCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many OneClickJobs.
     */
    data: OneClickJobCreateManyInput | OneClickJobCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * OneClickJob createManyAndReturn
   */
  export type OneClickJobCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OneClickJob
     */
    select?: OneClickJobSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many OneClickJobs.
     */
    data: OneClickJobCreateManyInput | OneClickJobCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OneClickJobIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * OneClickJob update
   */
  export type OneClickJobUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OneClickJob
     */
    select?: OneClickJobSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OneClickJobInclude<ExtArgs> | null
    /**
     * The data needed to update a OneClickJob.
     */
    data: XOR<OneClickJobUpdateInput, OneClickJobUncheckedUpdateInput>
    /**
     * Choose, which OneClickJob to update.
     */
    where: OneClickJobWhereUniqueInput
  }

  /**
   * OneClickJob updateMany
   */
  export type OneClickJobUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update OneClickJobs.
     */
    data: XOR<OneClickJobUpdateManyMutationInput, OneClickJobUncheckedUpdateManyInput>
    /**
     * Filter which OneClickJobs to update
     */
    where?: OneClickJobWhereInput
  }

  /**
   * OneClickJob upsert
   */
  export type OneClickJobUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OneClickJob
     */
    select?: OneClickJobSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OneClickJobInclude<ExtArgs> | null
    /**
     * The filter to search for the OneClickJob to update in case it exists.
     */
    where: OneClickJobWhereUniqueInput
    /**
     * In case the OneClickJob found by the `where` argument doesn't exist, create a new OneClickJob with this data.
     */
    create: XOR<OneClickJobCreateInput, OneClickJobUncheckedCreateInput>
    /**
     * In case the OneClickJob was found with the provided `where` argument, update it with this data.
     */
    update: XOR<OneClickJobUpdateInput, OneClickJobUncheckedUpdateInput>
  }

  /**
   * OneClickJob delete
   */
  export type OneClickJobDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OneClickJob
     */
    select?: OneClickJobSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OneClickJobInclude<ExtArgs> | null
    /**
     * Filter which OneClickJob to delete.
     */
    where: OneClickJobWhereUniqueInput
  }

  /**
   * OneClickJob deleteMany
   */
  export type OneClickJobDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which OneClickJobs to delete
     */
    where?: OneClickJobWhereInput
  }

  /**
   * OneClickJob without action
   */
  export type OneClickJobDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OneClickJob
     */
    select?: OneClickJobSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OneClickJobInclude<ExtArgs> | null
  }


  /**
   * Model Resume
   */

  export type AggregateResume = {
    _count: ResumeCountAggregateOutputType | null
    _avg: ResumeAvgAggregateOutputType | null
    _sum: ResumeSumAggregateOutputType | null
    _min: ResumeMinAggregateOutputType | null
    _max: ResumeMaxAggregateOutputType | null
  }

  export type ResumeAvgAggregateOutputType = {
    id: number | null
    userId: number | null
  }

  export type ResumeSumAggregateOutputType = {
    id: number | null
    userId: number | null
  }

  export type ResumeMinAggregateOutputType = {
    id: number | null
    userId: number | null
    name: string | null
    rawText: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type ResumeMaxAggregateOutputType = {
    id: number | null
    userId: number | null
    name: string | null
    rawText: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type ResumeCountAggregateOutputType = {
    id: number
    userId: number
    name: number
    rawText: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type ResumeAvgAggregateInputType = {
    id?: true
    userId?: true
  }

  export type ResumeSumAggregateInputType = {
    id?: true
    userId?: true
  }

  export type ResumeMinAggregateInputType = {
    id?: true
    userId?: true
    name?: true
    rawText?: true
    createdAt?: true
    updatedAt?: true
  }

  export type ResumeMaxAggregateInputType = {
    id?: true
    userId?: true
    name?: true
    rawText?: true
    createdAt?: true
    updatedAt?: true
  }

  export type ResumeCountAggregateInputType = {
    id?: true
    userId?: true
    name?: true
    rawText?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type ResumeAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Resume to aggregate.
     */
    where?: ResumeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Resumes to fetch.
     */
    orderBy?: ResumeOrderByWithRelationInput | ResumeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ResumeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Resumes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Resumes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Resumes
    **/
    _count?: true | ResumeCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: ResumeAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: ResumeSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ResumeMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ResumeMaxAggregateInputType
  }

  export type GetResumeAggregateType<T extends ResumeAggregateArgs> = {
        [P in keyof T & keyof AggregateResume]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateResume[P]>
      : GetScalarType<T[P], AggregateResume[P]>
  }




  export type ResumeGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ResumeWhereInput
    orderBy?: ResumeOrderByWithAggregationInput | ResumeOrderByWithAggregationInput[]
    by: ResumeScalarFieldEnum[] | ResumeScalarFieldEnum
    having?: ResumeScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ResumeCountAggregateInputType | true
    _avg?: ResumeAvgAggregateInputType
    _sum?: ResumeSumAggregateInputType
    _min?: ResumeMinAggregateInputType
    _max?: ResumeMaxAggregateInputType
  }

  export type ResumeGroupByOutputType = {
    id: number
    userId: number
    name: string
    rawText: string
    createdAt: Date
    updatedAt: Date
    _count: ResumeCountAggregateOutputType | null
    _avg: ResumeAvgAggregateOutputType | null
    _sum: ResumeSumAggregateOutputType | null
    _min: ResumeMinAggregateOutputType | null
    _max: ResumeMaxAggregateOutputType | null
  }

  type GetResumeGroupByPayload<T extends ResumeGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ResumeGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ResumeGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ResumeGroupByOutputType[P]>
            : GetScalarType<T[P], ResumeGroupByOutputType[P]>
        }
      >
    >


  export type ResumeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    name?: boolean
    rawText?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
    tailoredResumes?: boolean | Resume$tailoredResumesArgs<ExtArgs>
    coverLetters?: boolean | Resume$coverLettersArgs<ExtArgs>
    _count?: boolean | ResumeCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["resume"]>

  export type ResumeSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    name?: boolean
    rawText?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["resume"]>

  export type ResumeSelectScalar = {
    id?: boolean
    userId?: boolean
    name?: boolean
    rawText?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type ResumeInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
    tailoredResumes?: boolean | Resume$tailoredResumesArgs<ExtArgs>
    coverLetters?: boolean | Resume$coverLettersArgs<ExtArgs>
    _count?: boolean | ResumeCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type ResumeIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $ResumePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Resume"
    objects: {
      user: Prisma.$UserPayload<ExtArgs>
      tailoredResumes: Prisma.$TailoredResumePayload<ExtArgs>[]
      coverLetters: Prisma.$CoverLetterPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      userId: number
      name: string
      rawText: string
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["resume"]>
    composites: {}
  }

  type ResumeGetPayload<S extends boolean | null | undefined | ResumeDefaultArgs> = $Result.GetResult<Prisma.$ResumePayload, S>

  type ResumeCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<ResumeFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: ResumeCountAggregateInputType | true
    }

  export interface ResumeDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Resume'], meta: { name: 'Resume' } }
    /**
     * Find zero or one Resume that matches the filter.
     * @param {ResumeFindUniqueArgs} args - Arguments to find a Resume
     * @example
     * // Get one Resume
     * const resume = await prisma.resume.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ResumeFindUniqueArgs>(args: SelectSubset<T, ResumeFindUniqueArgs<ExtArgs>>): Prisma__ResumeClient<$Result.GetResult<Prisma.$ResumePayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Resume that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {ResumeFindUniqueOrThrowArgs} args - Arguments to find a Resume
     * @example
     * // Get one Resume
     * const resume = await prisma.resume.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ResumeFindUniqueOrThrowArgs>(args: SelectSubset<T, ResumeFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ResumeClient<$Result.GetResult<Prisma.$ResumePayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Resume that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ResumeFindFirstArgs} args - Arguments to find a Resume
     * @example
     * // Get one Resume
     * const resume = await prisma.resume.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ResumeFindFirstArgs>(args?: SelectSubset<T, ResumeFindFirstArgs<ExtArgs>>): Prisma__ResumeClient<$Result.GetResult<Prisma.$ResumePayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Resume that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ResumeFindFirstOrThrowArgs} args - Arguments to find a Resume
     * @example
     * // Get one Resume
     * const resume = await prisma.resume.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ResumeFindFirstOrThrowArgs>(args?: SelectSubset<T, ResumeFindFirstOrThrowArgs<ExtArgs>>): Prisma__ResumeClient<$Result.GetResult<Prisma.$ResumePayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Resumes that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ResumeFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Resumes
     * const resumes = await prisma.resume.findMany()
     * 
     * // Get first 10 Resumes
     * const resumes = await prisma.resume.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const resumeWithIdOnly = await prisma.resume.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ResumeFindManyArgs>(args?: SelectSubset<T, ResumeFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ResumePayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Resume.
     * @param {ResumeCreateArgs} args - Arguments to create a Resume.
     * @example
     * // Create one Resume
     * const Resume = await prisma.resume.create({
     *   data: {
     *     // ... data to create a Resume
     *   }
     * })
     * 
     */
    create<T extends ResumeCreateArgs>(args: SelectSubset<T, ResumeCreateArgs<ExtArgs>>): Prisma__ResumeClient<$Result.GetResult<Prisma.$ResumePayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Resumes.
     * @param {ResumeCreateManyArgs} args - Arguments to create many Resumes.
     * @example
     * // Create many Resumes
     * const resume = await prisma.resume.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ResumeCreateManyArgs>(args?: SelectSubset<T, ResumeCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Resumes and returns the data saved in the database.
     * @param {ResumeCreateManyAndReturnArgs} args - Arguments to create many Resumes.
     * @example
     * // Create many Resumes
     * const resume = await prisma.resume.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Resumes and only return the `id`
     * const resumeWithIdOnly = await prisma.resume.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ResumeCreateManyAndReturnArgs>(args?: SelectSubset<T, ResumeCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ResumePayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a Resume.
     * @param {ResumeDeleteArgs} args - Arguments to delete one Resume.
     * @example
     * // Delete one Resume
     * const Resume = await prisma.resume.delete({
     *   where: {
     *     // ... filter to delete one Resume
     *   }
     * })
     * 
     */
    delete<T extends ResumeDeleteArgs>(args: SelectSubset<T, ResumeDeleteArgs<ExtArgs>>): Prisma__ResumeClient<$Result.GetResult<Prisma.$ResumePayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Resume.
     * @param {ResumeUpdateArgs} args - Arguments to update one Resume.
     * @example
     * // Update one Resume
     * const resume = await prisma.resume.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ResumeUpdateArgs>(args: SelectSubset<T, ResumeUpdateArgs<ExtArgs>>): Prisma__ResumeClient<$Result.GetResult<Prisma.$ResumePayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Resumes.
     * @param {ResumeDeleteManyArgs} args - Arguments to filter Resumes to delete.
     * @example
     * // Delete a few Resumes
     * const { count } = await prisma.resume.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ResumeDeleteManyArgs>(args?: SelectSubset<T, ResumeDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Resumes.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ResumeUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Resumes
     * const resume = await prisma.resume.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ResumeUpdateManyArgs>(args: SelectSubset<T, ResumeUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Resume.
     * @param {ResumeUpsertArgs} args - Arguments to update or create a Resume.
     * @example
     * // Update or create a Resume
     * const resume = await prisma.resume.upsert({
     *   create: {
     *     // ... data to create a Resume
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Resume we want to update
     *   }
     * })
     */
    upsert<T extends ResumeUpsertArgs>(args: SelectSubset<T, ResumeUpsertArgs<ExtArgs>>): Prisma__ResumeClient<$Result.GetResult<Prisma.$ResumePayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Resumes.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ResumeCountArgs} args - Arguments to filter Resumes to count.
     * @example
     * // Count the number of Resumes
     * const count = await prisma.resume.count({
     *   where: {
     *     // ... the filter for the Resumes we want to count
     *   }
     * })
    **/
    count<T extends ResumeCountArgs>(
      args?: Subset<T, ResumeCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ResumeCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Resume.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ResumeAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ResumeAggregateArgs>(args: Subset<T, ResumeAggregateArgs>): Prisma.PrismaPromise<GetResumeAggregateType<T>>

    /**
     * Group by Resume.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ResumeGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ResumeGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ResumeGroupByArgs['orderBy'] }
        : { orderBy?: ResumeGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ResumeGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetResumeGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Resume model
   */
  readonly fields: ResumeFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Resume.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ResumeClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    tailoredResumes<T extends Resume$tailoredResumesArgs<ExtArgs> = {}>(args?: Subset<T, Resume$tailoredResumesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TailoredResumePayload<ExtArgs>, T, "findMany"> | Null>
    coverLetters<T extends Resume$coverLettersArgs<ExtArgs> = {}>(args?: Subset<T, Resume$coverLettersArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CoverLetterPayload<ExtArgs>, T, "findMany"> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Resume model
   */ 
  interface ResumeFieldRefs {
    readonly id: FieldRef<"Resume", 'Int'>
    readonly userId: FieldRef<"Resume", 'Int'>
    readonly name: FieldRef<"Resume", 'String'>
    readonly rawText: FieldRef<"Resume", 'String'>
    readonly createdAt: FieldRef<"Resume", 'DateTime'>
    readonly updatedAt: FieldRef<"Resume", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Resume findUnique
   */
  export type ResumeFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Resume
     */
    select?: ResumeSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ResumeInclude<ExtArgs> | null
    /**
     * Filter, which Resume to fetch.
     */
    where: ResumeWhereUniqueInput
  }

  /**
   * Resume findUniqueOrThrow
   */
  export type ResumeFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Resume
     */
    select?: ResumeSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ResumeInclude<ExtArgs> | null
    /**
     * Filter, which Resume to fetch.
     */
    where: ResumeWhereUniqueInput
  }

  /**
   * Resume findFirst
   */
  export type ResumeFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Resume
     */
    select?: ResumeSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ResumeInclude<ExtArgs> | null
    /**
     * Filter, which Resume to fetch.
     */
    where?: ResumeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Resumes to fetch.
     */
    orderBy?: ResumeOrderByWithRelationInput | ResumeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Resumes.
     */
    cursor?: ResumeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Resumes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Resumes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Resumes.
     */
    distinct?: ResumeScalarFieldEnum | ResumeScalarFieldEnum[]
  }

  /**
   * Resume findFirstOrThrow
   */
  export type ResumeFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Resume
     */
    select?: ResumeSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ResumeInclude<ExtArgs> | null
    /**
     * Filter, which Resume to fetch.
     */
    where?: ResumeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Resumes to fetch.
     */
    orderBy?: ResumeOrderByWithRelationInput | ResumeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Resumes.
     */
    cursor?: ResumeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Resumes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Resumes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Resumes.
     */
    distinct?: ResumeScalarFieldEnum | ResumeScalarFieldEnum[]
  }

  /**
   * Resume findMany
   */
  export type ResumeFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Resume
     */
    select?: ResumeSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ResumeInclude<ExtArgs> | null
    /**
     * Filter, which Resumes to fetch.
     */
    where?: ResumeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Resumes to fetch.
     */
    orderBy?: ResumeOrderByWithRelationInput | ResumeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Resumes.
     */
    cursor?: ResumeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Resumes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Resumes.
     */
    skip?: number
    distinct?: ResumeScalarFieldEnum | ResumeScalarFieldEnum[]
  }

  /**
   * Resume create
   */
  export type ResumeCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Resume
     */
    select?: ResumeSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ResumeInclude<ExtArgs> | null
    /**
     * The data needed to create a Resume.
     */
    data: XOR<ResumeCreateInput, ResumeUncheckedCreateInput>
  }

  /**
   * Resume createMany
   */
  export type ResumeCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Resumes.
     */
    data: ResumeCreateManyInput | ResumeCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Resume createManyAndReturn
   */
  export type ResumeCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Resume
     */
    select?: ResumeSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Resumes.
     */
    data: ResumeCreateManyInput | ResumeCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ResumeIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Resume update
   */
  export type ResumeUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Resume
     */
    select?: ResumeSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ResumeInclude<ExtArgs> | null
    /**
     * The data needed to update a Resume.
     */
    data: XOR<ResumeUpdateInput, ResumeUncheckedUpdateInput>
    /**
     * Choose, which Resume to update.
     */
    where: ResumeWhereUniqueInput
  }

  /**
   * Resume updateMany
   */
  export type ResumeUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Resumes.
     */
    data: XOR<ResumeUpdateManyMutationInput, ResumeUncheckedUpdateManyInput>
    /**
     * Filter which Resumes to update
     */
    where?: ResumeWhereInput
  }

  /**
   * Resume upsert
   */
  export type ResumeUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Resume
     */
    select?: ResumeSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ResumeInclude<ExtArgs> | null
    /**
     * The filter to search for the Resume to update in case it exists.
     */
    where: ResumeWhereUniqueInput
    /**
     * In case the Resume found by the `where` argument doesn't exist, create a new Resume with this data.
     */
    create: XOR<ResumeCreateInput, ResumeUncheckedCreateInput>
    /**
     * In case the Resume was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ResumeUpdateInput, ResumeUncheckedUpdateInput>
  }

  /**
   * Resume delete
   */
  export type ResumeDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Resume
     */
    select?: ResumeSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ResumeInclude<ExtArgs> | null
    /**
     * Filter which Resume to delete.
     */
    where: ResumeWhereUniqueInput
  }

  /**
   * Resume deleteMany
   */
  export type ResumeDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Resumes to delete
     */
    where?: ResumeWhereInput
  }

  /**
   * Resume.tailoredResumes
   */
  export type Resume$tailoredResumesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TailoredResume
     */
    select?: TailoredResumeSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TailoredResumeInclude<ExtArgs> | null
    where?: TailoredResumeWhereInput
    orderBy?: TailoredResumeOrderByWithRelationInput | TailoredResumeOrderByWithRelationInput[]
    cursor?: TailoredResumeWhereUniqueInput
    take?: number
    skip?: number
    distinct?: TailoredResumeScalarFieldEnum | TailoredResumeScalarFieldEnum[]
  }

  /**
   * Resume.coverLetters
   */
  export type Resume$coverLettersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CoverLetter
     */
    select?: CoverLetterSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CoverLetterInclude<ExtArgs> | null
    where?: CoverLetterWhereInput
    orderBy?: CoverLetterOrderByWithRelationInput | CoverLetterOrderByWithRelationInput[]
    cursor?: CoverLetterWhereUniqueInput
    take?: number
    skip?: number
    distinct?: CoverLetterScalarFieldEnum | CoverLetterScalarFieldEnum[]
  }

  /**
   * Resume without action
   */
  export type ResumeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Resume
     */
    select?: ResumeSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ResumeInclude<ExtArgs> | null
  }


  /**
   * Model JobApplication
   */

  export type AggregateJobApplication = {
    _count: JobApplicationCountAggregateOutputType | null
    _avg: JobApplicationAvgAggregateOutputType | null
    _sum: JobApplicationSumAggregateOutputType | null
    _min: JobApplicationMinAggregateOutputType | null
    _max: JobApplicationMaxAggregateOutputType | null
  }

  export type JobApplicationAvgAggregateOutputType = {
    id: number | null
    userId: number | null
    jobrightMatchScore: number | null
  }

  export type JobApplicationSumAggregateOutputType = {
    id: number | null
    userId: number | null
    jobrightMatchScore: number | null
  }

  export type JobApplicationMinAggregateOutputType = {
    id: number | null
    userId: number | null
    source: string | null
    jobrightJobId: string | null
    title: string | null
    company: string | null
    location: string | null
    jobType: $Enums.JobType | null
    jobrightMatchScore: number | null
    jobrightBoard: string | null
    jobrightUrl: string | null
    externalUrl: string | null
    status: $Enums.ApplicationStatus | null
    invitedToInterview: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
    appliedAt: Date | null
  }

  export type JobApplicationMaxAggregateOutputType = {
    id: number | null
    userId: number | null
    source: string | null
    jobrightJobId: string | null
    title: string | null
    company: string | null
    location: string | null
    jobType: $Enums.JobType | null
    jobrightMatchScore: number | null
    jobrightBoard: string | null
    jobrightUrl: string | null
    externalUrl: string | null
    status: $Enums.ApplicationStatus | null
    invitedToInterview: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
    appliedAt: Date | null
  }

  export type JobApplicationCountAggregateOutputType = {
    id: number
    userId: number
    source: number
    jobrightJobId: number
    title: number
    company: number
    location: number
    jobType: number
    jobrightMatchScore: number
    jobrightBoard: number
    jobrightUrl: number
    externalUrl: number
    status: number
    invitedToInterview: number
    createdAt: number
    updatedAt: number
    appliedAt: number
    _all: number
  }


  export type JobApplicationAvgAggregateInputType = {
    id?: true
    userId?: true
    jobrightMatchScore?: true
  }

  export type JobApplicationSumAggregateInputType = {
    id?: true
    userId?: true
    jobrightMatchScore?: true
  }

  export type JobApplicationMinAggregateInputType = {
    id?: true
    userId?: true
    source?: true
    jobrightJobId?: true
    title?: true
    company?: true
    location?: true
    jobType?: true
    jobrightMatchScore?: true
    jobrightBoard?: true
    jobrightUrl?: true
    externalUrl?: true
    status?: true
    invitedToInterview?: true
    createdAt?: true
    updatedAt?: true
    appliedAt?: true
  }

  export type JobApplicationMaxAggregateInputType = {
    id?: true
    userId?: true
    source?: true
    jobrightJobId?: true
    title?: true
    company?: true
    location?: true
    jobType?: true
    jobrightMatchScore?: true
    jobrightBoard?: true
    jobrightUrl?: true
    externalUrl?: true
    status?: true
    invitedToInterview?: true
    createdAt?: true
    updatedAt?: true
    appliedAt?: true
  }

  export type JobApplicationCountAggregateInputType = {
    id?: true
    userId?: true
    source?: true
    jobrightJobId?: true
    title?: true
    company?: true
    location?: true
    jobType?: true
    jobrightMatchScore?: true
    jobrightBoard?: true
    jobrightUrl?: true
    externalUrl?: true
    status?: true
    invitedToInterview?: true
    createdAt?: true
    updatedAt?: true
    appliedAt?: true
    _all?: true
  }

  export type JobApplicationAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which JobApplication to aggregate.
     */
    where?: JobApplicationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of JobApplications to fetch.
     */
    orderBy?: JobApplicationOrderByWithRelationInput | JobApplicationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: JobApplicationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` JobApplications from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` JobApplications.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned JobApplications
    **/
    _count?: true | JobApplicationCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: JobApplicationAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: JobApplicationSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: JobApplicationMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: JobApplicationMaxAggregateInputType
  }

  export type GetJobApplicationAggregateType<T extends JobApplicationAggregateArgs> = {
        [P in keyof T & keyof AggregateJobApplication]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateJobApplication[P]>
      : GetScalarType<T[P], AggregateJobApplication[P]>
  }




  export type JobApplicationGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: JobApplicationWhereInput
    orderBy?: JobApplicationOrderByWithAggregationInput | JobApplicationOrderByWithAggregationInput[]
    by: JobApplicationScalarFieldEnum[] | JobApplicationScalarFieldEnum
    having?: JobApplicationScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: JobApplicationCountAggregateInputType | true
    _avg?: JobApplicationAvgAggregateInputType
    _sum?: JobApplicationSumAggregateInputType
    _min?: JobApplicationMinAggregateInputType
    _max?: JobApplicationMaxAggregateInputType
  }

  export type JobApplicationGroupByOutputType = {
    id: number
    userId: number
    source: string
    jobrightJobId: string | null
    title: string
    company: string
    location: string | null
    jobType: $Enums.JobType
    jobrightMatchScore: number | null
    jobrightBoard: string | null
    jobrightUrl: string | null
    externalUrl: string
    status: $Enums.ApplicationStatus
    invitedToInterview: boolean
    createdAt: Date
    updatedAt: Date
    appliedAt: Date | null
    _count: JobApplicationCountAggregateOutputType | null
    _avg: JobApplicationAvgAggregateOutputType | null
    _sum: JobApplicationSumAggregateOutputType | null
    _min: JobApplicationMinAggregateOutputType | null
    _max: JobApplicationMaxAggregateOutputType | null
  }

  type GetJobApplicationGroupByPayload<T extends JobApplicationGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<JobApplicationGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof JobApplicationGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], JobApplicationGroupByOutputType[P]>
            : GetScalarType<T[P], JobApplicationGroupByOutputType[P]>
        }
      >
    >


  export type JobApplicationSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    source?: boolean
    jobrightJobId?: boolean
    title?: boolean
    company?: boolean
    location?: boolean
    jobType?: boolean
    jobrightMatchScore?: boolean
    jobrightBoard?: boolean
    jobrightUrl?: boolean
    externalUrl?: boolean
    status?: boolean
    invitedToInterview?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    appliedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
    jobDescription?: boolean | JobApplication$jobDescriptionArgs<ExtArgs>
    tailoredResumes?: boolean | JobApplication$tailoredResumesArgs<ExtArgs>
    coverLetters?: boolean | JobApplication$coverLettersArgs<ExtArgs>
    _count?: boolean | JobApplicationCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["jobApplication"]>

  export type JobApplicationSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    source?: boolean
    jobrightJobId?: boolean
    title?: boolean
    company?: boolean
    location?: boolean
    jobType?: boolean
    jobrightMatchScore?: boolean
    jobrightBoard?: boolean
    jobrightUrl?: boolean
    externalUrl?: boolean
    status?: boolean
    invitedToInterview?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    appliedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["jobApplication"]>

  export type JobApplicationSelectScalar = {
    id?: boolean
    userId?: boolean
    source?: boolean
    jobrightJobId?: boolean
    title?: boolean
    company?: boolean
    location?: boolean
    jobType?: boolean
    jobrightMatchScore?: boolean
    jobrightBoard?: boolean
    jobrightUrl?: boolean
    externalUrl?: boolean
    status?: boolean
    invitedToInterview?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    appliedAt?: boolean
  }

  export type JobApplicationInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
    jobDescription?: boolean | JobApplication$jobDescriptionArgs<ExtArgs>
    tailoredResumes?: boolean | JobApplication$tailoredResumesArgs<ExtArgs>
    coverLetters?: boolean | JobApplication$coverLettersArgs<ExtArgs>
    _count?: boolean | JobApplicationCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type JobApplicationIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $JobApplicationPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "JobApplication"
    objects: {
      user: Prisma.$UserPayload<ExtArgs>
      jobDescription: Prisma.$JobDescriptionPayload<ExtArgs> | null
      tailoredResumes: Prisma.$TailoredResumePayload<ExtArgs>[]
      coverLetters: Prisma.$CoverLetterPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      userId: number
      source: string
      jobrightJobId: string | null
      title: string
      company: string
      location: string | null
      jobType: $Enums.JobType
      jobrightMatchScore: number | null
      jobrightBoard: string | null
      jobrightUrl: string | null
      externalUrl: string
      status: $Enums.ApplicationStatus
      invitedToInterview: boolean
      createdAt: Date
      updatedAt: Date
      appliedAt: Date | null
    }, ExtArgs["result"]["jobApplication"]>
    composites: {}
  }

  type JobApplicationGetPayload<S extends boolean | null | undefined | JobApplicationDefaultArgs> = $Result.GetResult<Prisma.$JobApplicationPayload, S>

  type JobApplicationCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<JobApplicationFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: JobApplicationCountAggregateInputType | true
    }

  export interface JobApplicationDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['JobApplication'], meta: { name: 'JobApplication' } }
    /**
     * Find zero or one JobApplication that matches the filter.
     * @param {JobApplicationFindUniqueArgs} args - Arguments to find a JobApplication
     * @example
     * // Get one JobApplication
     * const jobApplication = await prisma.jobApplication.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends JobApplicationFindUniqueArgs>(args: SelectSubset<T, JobApplicationFindUniqueArgs<ExtArgs>>): Prisma__JobApplicationClient<$Result.GetResult<Prisma.$JobApplicationPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one JobApplication that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {JobApplicationFindUniqueOrThrowArgs} args - Arguments to find a JobApplication
     * @example
     * // Get one JobApplication
     * const jobApplication = await prisma.jobApplication.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends JobApplicationFindUniqueOrThrowArgs>(args: SelectSubset<T, JobApplicationFindUniqueOrThrowArgs<ExtArgs>>): Prisma__JobApplicationClient<$Result.GetResult<Prisma.$JobApplicationPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first JobApplication that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {JobApplicationFindFirstArgs} args - Arguments to find a JobApplication
     * @example
     * // Get one JobApplication
     * const jobApplication = await prisma.jobApplication.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends JobApplicationFindFirstArgs>(args?: SelectSubset<T, JobApplicationFindFirstArgs<ExtArgs>>): Prisma__JobApplicationClient<$Result.GetResult<Prisma.$JobApplicationPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first JobApplication that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {JobApplicationFindFirstOrThrowArgs} args - Arguments to find a JobApplication
     * @example
     * // Get one JobApplication
     * const jobApplication = await prisma.jobApplication.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends JobApplicationFindFirstOrThrowArgs>(args?: SelectSubset<T, JobApplicationFindFirstOrThrowArgs<ExtArgs>>): Prisma__JobApplicationClient<$Result.GetResult<Prisma.$JobApplicationPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more JobApplications that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {JobApplicationFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all JobApplications
     * const jobApplications = await prisma.jobApplication.findMany()
     * 
     * // Get first 10 JobApplications
     * const jobApplications = await prisma.jobApplication.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const jobApplicationWithIdOnly = await prisma.jobApplication.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends JobApplicationFindManyArgs>(args?: SelectSubset<T, JobApplicationFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$JobApplicationPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a JobApplication.
     * @param {JobApplicationCreateArgs} args - Arguments to create a JobApplication.
     * @example
     * // Create one JobApplication
     * const JobApplication = await prisma.jobApplication.create({
     *   data: {
     *     // ... data to create a JobApplication
     *   }
     * })
     * 
     */
    create<T extends JobApplicationCreateArgs>(args: SelectSubset<T, JobApplicationCreateArgs<ExtArgs>>): Prisma__JobApplicationClient<$Result.GetResult<Prisma.$JobApplicationPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many JobApplications.
     * @param {JobApplicationCreateManyArgs} args - Arguments to create many JobApplications.
     * @example
     * // Create many JobApplications
     * const jobApplication = await prisma.jobApplication.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends JobApplicationCreateManyArgs>(args?: SelectSubset<T, JobApplicationCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many JobApplications and returns the data saved in the database.
     * @param {JobApplicationCreateManyAndReturnArgs} args - Arguments to create many JobApplications.
     * @example
     * // Create many JobApplications
     * const jobApplication = await prisma.jobApplication.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many JobApplications and only return the `id`
     * const jobApplicationWithIdOnly = await prisma.jobApplication.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends JobApplicationCreateManyAndReturnArgs>(args?: SelectSubset<T, JobApplicationCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$JobApplicationPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a JobApplication.
     * @param {JobApplicationDeleteArgs} args - Arguments to delete one JobApplication.
     * @example
     * // Delete one JobApplication
     * const JobApplication = await prisma.jobApplication.delete({
     *   where: {
     *     // ... filter to delete one JobApplication
     *   }
     * })
     * 
     */
    delete<T extends JobApplicationDeleteArgs>(args: SelectSubset<T, JobApplicationDeleteArgs<ExtArgs>>): Prisma__JobApplicationClient<$Result.GetResult<Prisma.$JobApplicationPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one JobApplication.
     * @param {JobApplicationUpdateArgs} args - Arguments to update one JobApplication.
     * @example
     * // Update one JobApplication
     * const jobApplication = await prisma.jobApplication.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends JobApplicationUpdateArgs>(args: SelectSubset<T, JobApplicationUpdateArgs<ExtArgs>>): Prisma__JobApplicationClient<$Result.GetResult<Prisma.$JobApplicationPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more JobApplications.
     * @param {JobApplicationDeleteManyArgs} args - Arguments to filter JobApplications to delete.
     * @example
     * // Delete a few JobApplications
     * const { count } = await prisma.jobApplication.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends JobApplicationDeleteManyArgs>(args?: SelectSubset<T, JobApplicationDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more JobApplications.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {JobApplicationUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many JobApplications
     * const jobApplication = await prisma.jobApplication.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends JobApplicationUpdateManyArgs>(args: SelectSubset<T, JobApplicationUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one JobApplication.
     * @param {JobApplicationUpsertArgs} args - Arguments to update or create a JobApplication.
     * @example
     * // Update or create a JobApplication
     * const jobApplication = await prisma.jobApplication.upsert({
     *   create: {
     *     // ... data to create a JobApplication
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the JobApplication we want to update
     *   }
     * })
     */
    upsert<T extends JobApplicationUpsertArgs>(args: SelectSubset<T, JobApplicationUpsertArgs<ExtArgs>>): Prisma__JobApplicationClient<$Result.GetResult<Prisma.$JobApplicationPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of JobApplications.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {JobApplicationCountArgs} args - Arguments to filter JobApplications to count.
     * @example
     * // Count the number of JobApplications
     * const count = await prisma.jobApplication.count({
     *   where: {
     *     // ... the filter for the JobApplications we want to count
     *   }
     * })
    **/
    count<T extends JobApplicationCountArgs>(
      args?: Subset<T, JobApplicationCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], JobApplicationCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a JobApplication.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {JobApplicationAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends JobApplicationAggregateArgs>(args: Subset<T, JobApplicationAggregateArgs>): Prisma.PrismaPromise<GetJobApplicationAggregateType<T>>

    /**
     * Group by JobApplication.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {JobApplicationGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends JobApplicationGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: JobApplicationGroupByArgs['orderBy'] }
        : { orderBy?: JobApplicationGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, JobApplicationGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetJobApplicationGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the JobApplication model
   */
  readonly fields: JobApplicationFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for JobApplication.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__JobApplicationClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    jobDescription<T extends JobApplication$jobDescriptionArgs<ExtArgs> = {}>(args?: Subset<T, JobApplication$jobDescriptionArgs<ExtArgs>>): Prisma__JobDescriptionClient<$Result.GetResult<Prisma.$JobDescriptionPayload<ExtArgs>, T, "findUniqueOrThrow"> | null, null, ExtArgs>
    tailoredResumes<T extends JobApplication$tailoredResumesArgs<ExtArgs> = {}>(args?: Subset<T, JobApplication$tailoredResumesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TailoredResumePayload<ExtArgs>, T, "findMany"> | Null>
    coverLetters<T extends JobApplication$coverLettersArgs<ExtArgs> = {}>(args?: Subset<T, JobApplication$coverLettersArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CoverLetterPayload<ExtArgs>, T, "findMany"> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the JobApplication model
   */ 
  interface JobApplicationFieldRefs {
    readonly id: FieldRef<"JobApplication", 'Int'>
    readonly userId: FieldRef<"JobApplication", 'Int'>
    readonly source: FieldRef<"JobApplication", 'String'>
    readonly jobrightJobId: FieldRef<"JobApplication", 'String'>
    readonly title: FieldRef<"JobApplication", 'String'>
    readonly company: FieldRef<"JobApplication", 'String'>
    readonly location: FieldRef<"JobApplication", 'String'>
    readonly jobType: FieldRef<"JobApplication", 'JobType'>
    readonly jobrightMatchScore: FieldRef<"JobApplication", 'Float'>
    readonly jobrightBoard: FieldRef<"JobApplication", 'String'>
    readonly jobrightUrl: FieldRef<"JobApplication", 'String'>
    readonly externalUrl: FieldRef<"JobApplication", 'String'>
    readonly status: FieldRef<"JobApplication", 'ApplicationStatus'>
    readonly invitedToInterview: FieldRef<"JobApplication", 'Boolean'>
    readonly createdAt: FieldRef<"JobApplication", 'DateTime'>
    readonly updatedAt: FieldRef<"JobApplication", 'DateTime'>
    readonly appliedAt: FieldRef<"JobApplication", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * JobApplication findUnique
   */
  export type JobApplicationFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the JobApplication
     */
    select?: JobApplicationSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: JobApplicationInclude<ExtArgs> | null
    /**
     * Filter, which JobApplication to fetch.
     */
    where: JobApplicationWhereUniqueInput
  }

  /**
   * JobApplication findUniqueOrThrow
   */
  export type JobApplicationFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the JobApplication
     */
    select?: JobApplicationSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: JobApplicationInclude<ExtArgs> | null
    /**
     * Filter, which JobApplication to fetch.
     */
    where: JobApplicationWhereUniqueInput
  }

  /**
   * JobApplication findFirst
   */
  export type JobApplicationFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the JobApplication
     */
    select?: JobApplicationSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: JobApplicationInclude<ExtArgs> | null
    /**
     * Filter, which JobApplication to fetch.
     */
    where?: JobApplicationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of JobApplications to fetch.
     */
    orderBy?: JobApplicationOrderByWithRelationInput | JobApplicationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for JobApplications.
     */
    cursor?: JobApplicationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` JobApplications from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` JobApplications.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of JobApplications.
     */
    distinct?: JobApplicationScalarFieldEnum | JobApplicationScalarFieldEnum[]
  }

  /**
   * JobApplication findFirstOrThrow
   */
  export type JobApplicationFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the JobApplication
     */
    select?: JobApplicationSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: JobApplicationInclude<ExtArgs> | null
    /**
     * Filter, which JobApplication to fetch.
     */
    where?: JobApplicationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of JobApplications to fetch.
     */
    orderBy?: JobApplicationOrderByWithRelationInput | JobApplicationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for JobApplications.
     */
    cursor?: JobApplicationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` JobApplications from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` JobApplications.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of JobApplications.
     */
    distinct?: JobApplicationScalarFieldEnum | JobApplicationScalarFieldEnum[]
  }

  /**
   * JobApplication findMany
   */
  export type JobApplicationFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the JobApplication
     */
    select?: JobApplicationSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: JobApplicationInclude<ExtArgs> | null
    /**
     * Filter, which JobApplications to fetch.
     */
    where?: JobApplicationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of JobApplications to fetch.
     */
    orderBy?: JobApplicationOrderByWithRelationInput | JobApplicationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing JobApplications.
     */
    cursor?: JobApplicationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` JobApplications from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` JobApplications.
     */
    skip?: number
    distinct?: JobApplicationScalarFieldEnum | JobApplicationScalarFieldEnum[]
  }

  /**
   * JobApplication create
   */
  export type JobApplicationCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the JobApplication
     */
    select?: JobApplicationSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: JobApplicationInclude<ExtArgs> | null
    /**
     * The data needed to create a JobApplication.
     */
    data: XOR<JobApplicationCreateInput, JobApplicationUncheckedCreateInput>
  }

  /**
   * JobApplication createMany
   */
  export type JobApplicationCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many JobApplications.
     */
    data: JobApplicationCreateManyInput | JobApplicationCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * JobApplication createManyAndReturn
   */
  export type JobApplicationCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the JobApplication
     */
    select?: JobApplicationSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many JobApplications.
     */
    data: JobApplicationCreateManyInput | JobApplicationCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: JobApplicationIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * JobApplication update
   */
  export type JobApplicationUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the JobApplication
     */
    select?: JobApplicationSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: JobApplicationInclude<ExtArgs> | null
    /**
     * The data needed to update a JobApplication.
     */
    data: XOR<JobApplicationUpdateInput, JobApplicationUncheckedUpdateInput>
    /**
     * Choose, which JobApplication to update.
     */
    where: JobApplicationWhereUniqueInput
  }

  /**
   * JobApplication updateMany
   */
  export type JobApplicationUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update JobApplications.
     */
    data: XOR<JobApplicationUpdateManyMutationInput, JobApplicationUncheckedUpdateManyInput>
    /**
     * Filter which JobApplications to update
     */
    where?: JobApplicationWhereInput
  }

  /**
   * JobApplication upsert
   */
  export type JobApplicationUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the JobApplication
     */
    select?: JobApplicationSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: JobApplicationInclude<ExtArgs> | null
    /**
     * The filter to search for the JobApplication to update in case it exists.
     */
    where: JobApplicationWhereUniqueInput
    /**
     * In case the JobApplication found by the `where` argument doesn't exist, create a new JobApplication with this data.
     */
    create: XOR<JobApplicationCreateInput, JobApplicationUncheckedCreateInput>
    /**
     * In case the JobApplication was found with the provided `where` argument, update it with this data.
     */
    update: XOR<JobApplicationUpdateInput, JobApplicationUncheckedUpdateInput>
  }

  /**
   * JobApplication delete
   */
  export type JobApplicationDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the JobApplication
     */
    select?: JobApplicationSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: JobApplicationInclude<ExtArgs> | null
    /**
     * Filter which JobApplication to delete.
     */
    where: JobApplicationWhereUniqueInput
  }

  /**
   * JobApplication deleteMany
   */
  export type JobApplicationDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which JobApplications to delete
     */
    where?: JobApplicationWhereInput
  }

  /**
   * JobApplication.jobDescription
   */
  export type JobApplication$jobDescriptionArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the JobDescription
     */
    select?: JobDescriptionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: JobDescriptionInclude<ExtArgs> | null
    where?: JobDescriptionWhereInput
  }

  /**
   * JobApplication.tailoredResumes
   */
  export type JobApplication$tailoredResumesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TailoredResume
     */
    select?: TailoredResumeSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TailoredResumeInclude<ExtArgs> | null
    where?: TailoredResumeWhereInput
    orderBy?: TailoredResumeOrderByWithRelationInput | TailoredResumeOrderByWithRelationInput[]
    cursor?: TailoredResumeWhereUniqueInput
    take?: number
    skip?: number
    distinct?: TailoredResumeScalarFieldEnum | TailoredResumeScalarFieldEnum[]
  }

  /**
   * JobApplication.coverLetters
   */
  export type JobApplication$coverLettersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CoverLetter
     */
    select?: CoverLetterSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CoverLetterInclude<ExtArgs> | null
    where?: CoverLetterWhereInput
    orderBy?: CoverLetterOrderByWithRelationInput | CoverLetterOrderByWithRelationInput[]
    cursor?: CoverLetterWhereUniqueInput
    take?: number
    skip?: number
    distinct?: CoverLetterScalarFieldEnum | CoverLetterScalarFieldEnum[]
  }

  /**
   * JobApplication without action
   */
  export type JobApplicationDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the JobApplication
     */
    select?: JobApplicationSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: JobApplicationInclude<ExtArgs> | null
  }


  /**
   * Model JobDescription
   */

  export type AggregateJobDescription = {
    _count: JobDescriptionCountAggregateOutputType | null
    _avg: JobDescriptionAvgAggregateOutputType | null
    _sum: JobDescriptionSumAggregateOutputType | null
    _min: JobDescriptionMinAggregateOutputType | null
    _max: JobDescriptionMaxAggregateOutputType | null
  }

  export type JobDescriptionAvgAggregateOutputType = {
    id: number | null
    jobApplicationId: number | null
  }

  export type JobDescriptionSumAggregateOutputType = {
    id: number | null
    jobApplicationId: number | null
  }

  export type JobDescriptionMinAggregateOutputType = {
    id: number | null
    jobApplicationId: number | null
    fullText: string | null
    source: string | null
    createdAt: Date | null
  }

  export type JobDescriptionMaxAggregateOutputType = {
    id: number | null
    jobApplicationId: number | null
    fullText: string | null
    source: string | null
    createdAt: Date | null
  }

  export type JobDescriptionCountAggregateOutputType = {
    id: number
    jobApplicationId: number
    fullText: number
    source: number
    createdAt: number
    _all: number
  }


  export type JobDescriptionAvgAggregateInputType = {
    id?: true
    jobApplicationId?: true
  }

  export type JobDescriptionSumAggregateInputType = {
    id?: true
    jobApplicationId?: true
  }

  export type JobDescriptionMinAggregateInputType = {
    id?: true
    jobApplicationId?: true
    fullText?: true
    source?: true
    createdAt?: true
  }

  export type JobDescriptionMaxAggregateInputType = {
    id?: true
    jobApplicationId?: true
    fullText?: true
    source?: true
    createdAt?: true
  }

  export type JobDescriptionCountAggregateInputType = {
    id?: true
    jobApplicationId?: true
    fullText?: true
    source?: true
    createdAt?: true
    _all?: true
  }

  export type JobDescriptionAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which JobDescription to aggregate.
     */
    where?: JobDescriptionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of JobDescriptions to fetch.
     */
    orderBy?: JobDescriptionOrderByWithRelationInput | JobDescriptionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: JobDescriptionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` JobDescriptions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` JobDescriptions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned JobDescriptions
    **/
    _count?: true | JobDescriptionCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: JobDescriptionAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: JobDescriptionSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: JobDescriptionMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: JobDescriptionMaxAggregateInputType
  }

  export type GetJobDescriptionAggregateType<T extends JobDescriptionAggregateArgs> = {
        [P in keyof T & keyof AggregateJobDescription]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateJobDescription[P]>
      : GetScalarType<T[P], AggregateJobDescription[P]>
  }




  export type JobDescriptionGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: JobDescriptionWhereInput
    orderBy?: JobDescriptionOrderByWithAggregationInput | JobDescriptionOrderByWithAggregationInput[]
    by: JobDescriptionScalarFieldEnum[] | JobDescriptionScalarFieldEnum
    having?: JobDescriptionScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: JobDescriptionCountAggregateInputType | true
    _avg?: JobDescriptionAvgAggregateInputType
    _sum?: JobDescriptionSumAggregateInputType
    _min?: JobDescriptionMinAggregateInputType
    _max?: JobDescriptionMaxAggregateInputType
  }

  export type JobDescriptionGroupByOutputType = {
    id: number
    jobApplicationId: number
    fullText: string
    source: string
    createdAt: Date
    _count: JobDescriptionCountAggregateOutputType | null
    _avg: JobDescriptionAvgAggregateOutputType | null
    _sum: JobDescriptionSumAggregateOutputType | null
    _min: JobDescriptionMinAggregateOutputType | null
    _max: JobDescriptionMaxAggregateOutputType | null
  }

  type GetJobDescriptionGroupByPayload<T extends JobDescriptionGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<JobDescriptionGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof JobDescriptionGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], JobDescriptionGroupByOutputType[P]>
            : GetScalarType<T[P], JobDescriptionGroupByOutputType[P]>
        }
      >
    >


  export type JobDescriptionSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    jobApplicationId?: boolean
    fullText?: boolean
    source?: boolean
    createdAt?: boolean
    jobApplication?: boolean | JobApplicationDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["jobDescription"]>

  export type JobDescriptionSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    jobApplicationId?: boolean
    fullText?: boolean
    source?: boolean
    createdAt?: boolean
    jobApplication?: boolean | JobApplicationDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["jobDescription"]>

  export type JobDescriptionSelectScalar = {
    id?: boolean
    jobApplicationId?: boolean
    fullText?: boolean
    source?: boolean
    createdAt?: boolean
  }

  export type JobDescriptionInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    jobApplication?: boolean | JobApplicationDefaultArgs<ExtArgs>
  }
  export type JobDescriptionIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    jobApplication?: boolean | JobApplicationDefaultArgs<ExtArgs>
  }

  export type $JobDescriptionPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "JobDescription"
    objects: {
      jobApplication: Prisma.$JobApplicationPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      jobApplicationId: number
      fullText: string
      source: string
      createdAt: Date
    }, ExtArgs["result"]["jobDescription"]>
    composites: {}
  }

  type JobDescriptionGetPayload<S extends boolean | null | undefined | JobDescriptionDefaultArgs> = $Result.GetResult<Prisma.$JobDescriptionPayload, S>

  type JobDescriptionCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<JobDescriptionFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: JobDescriptionCountAggregateInputType | true
    }

  export interface JobDescriptionDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['JobDescription'], meta: { name: 'JobDescription' } }
    /**
     * Find zero or one JobDescription that matches the filter.
     * @param {JobDescriptionFindUniqueArgs} args - Arguments to find a JobDescription
     * @example
     * // Get one JobDescription
     * const jobDescription = await prisma.jobDescription.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends JobDescriptionFindUniqueArgs>(args: SelectSubset<T, JobDescriptionFindUniqueArgs<ExtArgs>>): Prisma__JobDescriptionClient<$Result.GetResult<Prisma.$JobDescriptionPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one JobDescription that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {JobDescriptionFindUniqueOrThrowArgs} args - Arguments to find a JobDescription
     * @example
     * // Get one JobDescription
     * const jobDescription = await prisma.jobDescription.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends JobDescriptionFindUniqueOrThrowArgs>(args: SelectSubset<T, JobDescriptionFindUniqueOrThrowArgs<ExtArgs>>): Prisma__JobDescriptionClient<$Result.GetResult<Prisma.$JobDescriptionPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first JobDescription that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {JobDescriptionFindFirstArgs} args - Arguments to find a JobDescription
     * @example
     * // Get one JobDescription
     * const jobDescription = await prisma.jobDescription.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends JobDescriptionFindFirstArgs>(args?: SelectSubset<T, JobDescriptionFindFirstArgs<ExtArgs>>): Prisma__JobDescriptionClient<$Result.GetResult<Prisma.$JobDescriptionPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first JobDescription that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {JobDescriptionFindFirstOrThrowArgs} args - Arguments to find a JobDescription
     * @example
     * // Get one JobDescription
     * const jobDescription = await prisma.jobDescription.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends JobDescriptionFindFirstOrThrowArgs>(args?: SelectSubset<T, JobDescriptionFindFirstOrThrowArgs<ExtArgs>>): Prisma__JobDescriptionClient<$Result.GetResult<Prisma.$JobDescriptionPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more JobDescriptions that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {JobDescriptionFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all JobDescriptions
     * const jobDescriptions = await prisma.jobDescription.findMany()
     * 
     * // Get first 10 JobDescriptions
     * const jobDescriptions = await prisma.jobDescription.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const jobDescriptionWithIdOnly = await prisma.jobDescription.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends JobDescriptionFindManyArgs>(args?: SelectSubset<T, JobDescriptionFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$JobDescriptionPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a JobDescription.
     * @param {JobDescriptionCreateArgs} args - Arguments to create a JobDescription.
     * @example
     * // Create one JobDescription
     * const JobDescription = await prisma.jobDescription.create({
     *   data: {
     *     // ... data to create a JobDescription
     *   }
     * })
     * 
     */
    create<T extends JobDescriptionCreateArgs>(args: SelectSubset<T, JobDescriptionCreateArgs<ExtArgs>>): Prisma__JobDescriptionClient<$Result.GetResult<Prisma.$JobDescriptionPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many JobDescriptions.
     * @param {JobDescriptionCreateManyArgs} args - Arguments to create many JobDescriptions.
     * @example
     * // Create many JobDescriptions
     * const jobDescription = await prisma.jobDescription.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends JobDescriptionCreateManyArgs>(args?: SelectSubset<T, JobDescriptionCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many JobDescriptions and returns the data saved in the database.
     * @param {JobDescriptionCreateManyAndReturnArgs} args - Arguments to create many JobDescriptions.
     * @example
     * // Create many JobDescriptions
     * const jobDescription = await prisma.jobDescription.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many JobDescriptions and only return the `id`
     * const jobDescriptionWithIdOnly = await prisma.jobDescription.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends JobDescriptionCreateManyAndReturnArgs>(args?: SelectSubset<T, JobDescriptionCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$JobDescriptionPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a JobDescription.
     * @param {JobDescriptionDeleteArgs} args - Arguments to delete one JobDescription.
     * @example
     * // Delete one JobDescription
     * const JobDescription = await prisma.jobDescription.delete({
     *   where: {
     *     // ... filter to delete one JobDescription
     *   }
     * })
     * 
     */
    delete<T extends JobDescriptionDeleteArgs>(args: SelectSubset<T, JobDescriptionDeleteArgs<ExtArgs>>): Prisma__JobDescriptionClient<$Result.GetResult<Prisma.$JobDescriptionPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one JobDescription.
     * @param {JobDescriptionUpdateArgs} args - Arguments to update one JobDescription.
     * @example
     * // Update one JobDescription
     * const jobDescription = await prisma.jobDescription.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends JobDescriptionUpdateArgs>(args: SelectSubset<T, JobDescriptionUpdateArgs<ExtArgs>>): Prisma__JobDescriptionClient<$Result.GetResult<Prisma.$JobDescriptionPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more JobDescriptions.
     * @param {JobDescriptionDeleteManyArgs} args - Arguments to filter JobDescriptions to delete.
     * @example
     * // Delete a few JobDescriptions
     * const { count } = await prisma.jobDescription.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends JobDescriptionDeleteManyArgs>(args?: SelectSubset<T, JobDescriptionDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more JobDescriptions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {JobDescriptionUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many JobDescriptions
     * const jobDescription = await prisma.jobDescription.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends JobDescriptionUpdateManyArgs>(args: SelectSubset<T, JobDescriptionUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one JobDescription.
     * @param {JobDescriptionUpsertArgs} args - Arguments to update or create a JobDescription.
     * @example
     * // Update or create a JobDescription
     * const jobDescription = await prisma.jobDescription.upsert({
     *   create: {
     *     // ... data to create a JobDescription
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the JobDescription we want to update
     *   }
     * })
     */
    upsert<T extends JobDescriptionUpsertArgs>(args: SelectSubset<T, JobDescriptionUpsertArgs<ExtArgs>>): Prisma__JobDescriptionClient<$Result.GetResult<Prisma.$JobDescriptionPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of JobDescriptions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {JobDescriptionCountArgs} args - Arguments to filter JobDescriptions to count.
     * @example
     * // Count the number of JobDescriptions
     * const count = await prisma.jobDescription.count({
     *   where: {
     *     // ... the filter for the JobDescriptions we want to count
     *   }
     * })
    **/
    count<T extends JobDescriptionCountArgs>(
      args?: Subset<T, JobDescriptionCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], JobDescriptionCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a JobDescription.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {JobDescriptionAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends JobDescriptionAggregateArgs>(args: Subset<T, JobDescriptionAggregateArgs>): Prisma.PrismaPromise<GetJobDescriptionAggregateType<T>>

    /**
     * Group by JobDescription.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {JobDescriptionGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends JobDescriptionGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: JobDescriptionGroupByArgs['orderBy'] }
        : { orderBy?: JobDescriptionGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, JobDescriptionGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetJobDescriptionGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the JobDescription model
   */
  readonly fields: JobDescriptionFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for JobDescription.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__JobDescriptionClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    jobApplication<T extends JobApplicationDefaultArgs<ExtArgs> = {}>(args?: Subset<T, JobApplicationDefaultArgs<ExtArgs>>): Prisma__JobApplicationClient<$Result.GetResult<Prisma.$JobApplicationPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the JobDescription model
   */ 
  interface JobDescriptionFieldRefs {
    readonly id: FieldRef<"JobDescription", 'Int'>
    readonly jobApplicationId: FieldRef<"JobDescription", 'Int'>
    readonly fullText: FieldRef<"JobDescription", 'String'>
    readonly source: FieldRef<"JobDescription", 'String'>
    readonly createdAt: FieldRef<"JobDescription", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * JobDescription findUnique
   */
  export type JobDescriptionFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the JobDescription
     */
    select?: JobDescriptionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: JobDescriptionInclude<ExtArgs> | null
    /**
     * Filter, which JobDescription to fetch.
     */
    where: JobDescriptionWhereUniqueInput
  }

  /**
   * JobDescription findUniqueOrThrow
   */
  export type JobDescriptionFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the JobDescription
     */
    select?: JobDescriptionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: JobDescriptionInclude<ExtArgs> | null
    /**
     * Filter, which JobDescription to fetch.
     */
    where: JobDescriptionWhereUniqueInput
  }

  /**
   * JobDescription findFirst
   */
  export type JobDescriptionFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the JobDescription
     */
    select?: JobDescriptionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: JobDescriptionInclude<ExtArgs> | null
    /**
     * Filter, which JobDescription to fetch.
     */
    where?: JobDescriptionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of JobDescriptions to fetch.
     */
    orderBy?: JobDescriptionOrderByWithRelationInput | JobDescriptionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for JobDescriptions.
     */
    cursor?: JobDescriptionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` JobDescriptions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` JobDescriptions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of JobDescriptions.
     */
    distinct?: JobDescriptionScalarFieldEnum | JobDescriptionScalarFieldEnum[]
  }

  /**
   * JobDescription findFirstOrThrow
   */
  export type JobDescriptionFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the JobDescription
     */
    select?: JobDescriptionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: JobDescriptionInclude<ExtArgs> | null
    /**
     * Filter, which JobDescription to fetch.
     */
    where?: JobDescriptionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of JobDescriptions to fetch.
     */
    orderBy?: JobDescriptionOrderByWithRelationInput | JobDescriptionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for JobDescriptions.
     */
    cursor?: JobDescriptionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` JobDescriptions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` JobDescriptions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of JobDescriptions.
     */
    distinct?: JobDescriptionScalarFieldEnum | JobDescriptionScalarFieldEnum[]
  }

  /**
   * JobDescription findMany
   */
  export type JobDescriptionFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the JobDescription
     */
    select?: JobDescriptionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: JobDescriptionInclude<ExtArgs> | null
    /**
     * Filter, which JobDescriptions to fetch.
     */
    where?: JobDescriptionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of JobDescriptions to fetch.
     */
    orderBy?: JobDescriptionOrderByWithRelationInput | JobDescriptionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing JobDescriptions.
     */
    cursor?: JobDescriptionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` JobDescriptions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` JobDescriptions.
     */
    skip?: number
    distinct?: JobDescriptionScalarFieldEnum | JobDescriptionScalarFieldEnum[]
  }

  /**
   * JobDescription create
   */
  export type JobDescriptionCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the JobDescription
     */
    select?: JobDescriptionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: JobDescriptionInclude<ExtArgs> | null
    /**
     * The data needed to create a JobDescription.
     */
    data: XOR<JobDescriptionCreateInput, JobDescriptionUncheckedCreateInput>
  }

  /**
   * JobDescription createMany
   */
  export type JobDescriptionCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many JobDescriptions.
     */
    data: JobDescriptionCreateManyInput | JobDescriptionCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * JobDescription createManyAndReturn
   */
  export type JobDescriptionCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the JobDescription
     */
    select?: JobDescriptionSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many JobDescriptions.
     */
    data: JobDescriptionCreateManyInput | JobDescriptionCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: JobDescriptionIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * JobDescription update
   */
  export type JobDescriptionUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the JobDescription
     */
    select?: JobDescriptionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: JobDescriptionInclude<ExtArgs> | null
    /**
     * The data needed to update a JobDescription.
     */
    data: XOR<JobDescriptionUpdateInput, JobDescriptionUncheckedUpdateInput>
    /**
     * Choose, which JobDescription to update.
     */
    where: JobDescriptionWhereUniqueInput
  }

  /**
   * JobDescription updateMany
   */
  export type JobDescriptionUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update JobDescriptions.
     */
    data: XOR<JobDescriptionUpdateManyMutationInput, JobDescriptionUncheckedUpdateManyInput>
    /**
     * Filter which JobDescriptions to update
     */
    where?: JobDescriptionWhereInput
  }

  /**
   * JobDescription upsert
   */
  export type JobDescriptionUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the JobDescription
     */
    select?: JobDescriptionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: JobDescriptionInclude<ExtArgs> | null
    /**
     * The filter to search for the JobDescription to update in case it exists.
     */
    where: JobDescriptionWhereUniqueInput
    /**
     * In case the JobDescription found by the `where` argument doesn't exist, create a new JobDescription with this data.
     */
    create: XOR<JobDescriptionCreateInput, JobDescriptionUncheckedCreateInput>
    /**
     * In case the JobDescription was found with the provided `where` argument, update it with this data.
     */
    update: XOR<JobDescriptionUpdateInput, JobDescriptionUncheckedUpdateInput>
  }

  /**
   * JobDescription delete
   */
  export type JobDescriptionDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the JobDescription
     */
    select?: JobDescriptionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: JobDescriptionInclude<ExtArgs> | null
    /**
     * Filter which JobDescription to delete.
     */
    where: JobDescriptionWhereUniqueInput
  }

  /**
   * JobDescription deleteMany
   */
  export type JobDescriptionDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which JobDescriptions to delete
     */
    where?: JobDescriptionWhereInput
  }

  /**
   * JobDescription without action
   */
  export type JobDescriptionDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the JobDescription
     */
    select?: JobDescriptionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: JobDescriptionInclude<ExtArgs> | null
  }


  /**
   * Model TailoredResume
   */

  export type AggregateTailoredResume = {
    _count: TailoredResumeCountAggregateOutputType | null
    _avg: TailoredResumeAvgAggregateOutputType | null
    _sum: TailoredResumeSumAggregateOutputType | null
    _min: TailoredResumeMinAggregateOutputType | null
    _max: TailoredResumeMaxAggregateOutputType | null
  }

  export type TailoredResumeAvgAggregateOutputType = {
    id: number | null
    jobApplicationId: number | null
    baseResumeId: number | null
  }

  export type TailoredResumeSumAggregateOutputType = {
    id: number | null
    jobApplicationId: number | null
    baseResumeId: number | null
  }

  export type TailoredResumeMinAggregateOutputType = {
    id: number | null
    jobApplicationId: number | null
    baseResumeId: number | null
    llmModel: string | null
    promptVersion: string | null
    outputText: string | null
    createdAt: Date | null
  }

  export type TailoredResumeMaxAggregateOutputType = {
    id: number | null
    jobApplicationId: number | null
    baseResumeId: number | null
    llmModel: string | null
    promptVersion: string | null
    outputText: string | null
    createdAt: Date | null
  }

  export type TailoredResumeCountAggregateOutputType = {
    id: number
    jobApplicationId: number
    baseResumeId: number
    llmModel: number
    promptVersion: number
    outputText: number
    createdAt: number
    _all: number
  }


  export type TailoredResumeAvgAggregateInputType = {
    id?: true
    jobApplicationId?: true
    baseResumeId?: true
  }

  export type TailoredResumeSumAggregateInputType = {
    id?: true
    jobApplicationId?: true
    baseResumeId?: true
  }

  export type TailoredResumeMinAggregateInputType = {
    id?: true
    jobApplicationId?: true
    baseResumeId?: true
    llmModel?: true
    promptVersion?: true
    outputText?: true
    createdAt?: true
  }

  export type TailoredResumeMaxAggregateInputType = {
    id?: true
    jobApplicationId?: true
    baseResumeId?: true
    llmModel?: true
    promptVersion?: true
    outputText?: true
    createdAt?: true
  }

  export type TailoredResumeCountAggregateInputType = {
    id?: true
    jobApplicationId?: true
    baseResumeId?: true
    llmModel?: true
    promptVersion?: true
    outputText?: true
    createdAt?: true
    _all?: true
  }

  export type TailoredResumeAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which TailoredResume to aggregate.
     */
    where?: TailoredResumeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TailoredResumes to fetch.
     */
    orderBy?: TailoredResumeOrderByWithRelationInput | TailoredResumeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: TailoredResumeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TailoredResumes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TailoredResumes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned TailoredResumes
    **/
    _count?: true | TailoredResumeCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: TailoredResumeAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: TailoredResumeSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: TailoredResumeMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: TailoredResumeMaxAggregateInputType
  }

  export type GetTailoredResumeAggregateType<T extends TailoredResumeAggregateArgs> = {
        [P in keyof T & keyof AggregateTailoredResume]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTailoredResume[P]>
      : GetScalarType<T[P], AggregateTailoredResume[P]>
  }




  export type TailoredResumeGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TailoredResumeWhereInput
    orderBy?: TailoredResumeOrderByWithAggregationInput | TailoredResumeOrderByWithAggregationInput[]
    by: TailoredResumeScalarFieldEnum[] | TailoredResumeScalarFieldEnum
    having?: TailoredResumeScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: TailoredResumeCountAggregateInputType | true
    _avg?: TailoredResumeAvgAggregateInputType
    _sum?: TailoredResumeSumAggregateInputType
    _min?: TailoredResumeMinAggregateInputType
    _max?: TailoredResumeMaxAggregateInputType
  }

  export type TailoredResumeGroupByOutputType = {
    id: number
    jobApplicationId: number
    baseResumeId: number
    llmModel: string
    promptVersion: string
    outputText: string
    createdAt: Date
    _count: TailoredResumeCountAggregateOutputType | null
    _avg: TailoredResumeAvgAggregateOutputType | null
    _sum: TailoredResumeSumAggregateOutputType | null
    _min: TailoredResumeMinAggregateOutputType | null
    _max: TailoredResumeMaxAggregateOutputType | null
  }

  type GetTailoredResumeGroupByPayload<T extends TailoredResumeGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<TailoredResumeGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof TailoredResumeGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], TailoredResumeGroupByOutputType[P]>
            : GetScalarType<T[P], TailoredResumeGroupByOutputType[P]>
        }
      >
    >


  export type TailoredResumeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    jobApplicationId?: boolean
    baseResumeId?: boolean
    llmModel?: boolean
    promptVersion?: boolean
    outputText?: boolean
    createdAt?: boolean
    jobApplication?: boolean | JobApplicationDefaultArgs<ExtArgs>
    baseResume?: boolean | ResumeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["tailoredResume"]>

  export type TailoredResumeSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    jobApplicationId?: boolean
    baseResumeId?: boolean
    llmModel?: boolean
    promptVersion?: boolean
    outputText?: boolean
    createdAt?: boolean
    jobApplication?: boolean | JobApplicationDefaultArgs<ExtArgs>
    baseResume?: boolean | ResumeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["tailoredResume"]>

  export type TailoredResumeSelectScalar = {
    id?: boolean
    jobApplicationId?: boolean
    baseResumeId?: boolean
    llmModel?: boolean
    promptVersion?: boolean
    outputText?: boolean
    createdAt?: boolean
  }

  export type TailoredResumeInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    jobApplication?: boolean | JobApplicationDefaultArgs<ExtArgs>
    baseResume?: boolean | ResumeDefaultArgs<ExtArgs>
  }
  export type TailoredResumeIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    jobApplication?: boolean | JobApplicationDefaultArgs<ExtArgs>
    baseResume?: boolean | ResumeDefaultArgs<ExtArgs>
  }

  export type $TailoredResumePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "TailoredResume"
    objects: {
      jobApplication: Prisma.$JobApplicationPayload<ExtArgs>
      baseResume: Prisma.$ResumePayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      jobApplicationId: number
      baseResumeId: number
      llmModel: string
      promptVersion: string
      outputText: string
      createdAt: Date
    }, ExtArgs["result"]["tailoredResume"]>
    composites: {}
  }

  type TailoredResumeGetPayload<S extends boolean | null | undefined | TailoredResumeDefaultArgs> = $Result.GetResult<Prisma.$TailoredResumePayload, S>

  type TailoredResumeCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<TailoredResumeFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: TailoredResumeCountAggregateInputType | true
    }

  export interface TailoredResumeDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['TailoredResume'], meta: { name: 'TailoredResume' } }
    /**
     * Find zero or one TailoredResume that matches the filter.
     * @param {TailoredResumeFindUniqueArgs} args - Arguments to find a TailoredResume
     * @example
     * // Get one TailoredResume
     * const tailoredResume = await prisma.tailoredResume.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends TailoredResumeFindUniqueArgs>(args: SelectSubset<T, TailoredResumeFindUniqueArgs<ExtArgs>>): Prisma__TailoredResumeClient<$Result.GetResult<Prisma.$TailoredResumePayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one TailoredResume that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {TailoredResumeFindUniqueOrThrowArgs} args - Arguments to find a TailoredResume
     * @example
     * // Get one TailoredResume
     * const tailoredResume = await prisma.tailoredResume.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends TailoredResumeFindUniqueOrThrowArgs>(args: SelectSubset<T, TailoredResumeFindUniqueOrThrowArgs<ExtArgs>>): Prisma__TailoredResumeClient<$Result.GetResult<Prisma.$TailoredResumePayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first TailoredResume that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TailoredResumeFindFirstArgs} args - Arguments to find a TailoredResume
     * @example
     * // Get one TailoredResume
     * const tailoredResume = await prisma.tailoredResume.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends TailoredResumeFindFirstArgs>(args?: SelectSubset<T, TailoredResumeFindFirstArgs<ExtArgs>>): Prisma__TailoredResumeClient<$Result.GetResult<Prisma.$TailoredResumePayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first TailoredResume that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TailoredResumeFindFirstOrThrowArgs} args - Arguments to find a TailoredResume
     * @example
     * // Get one TailoredResume
     * const tailoredResume = await prisma.tailoredResume.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends TailoredResumeFindFirstOrThrowArgs>(args?: SelectSubset<T, TailoredResumeFindFirstOrThrowArgs<ExtArgs>>): Prisma__TailoredResumeClient<$Result.GetResult<Prisma.$TailoredResumePayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more TailoredResumes that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TailoredResumeFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all TailoredResumes
     * const tailoredResumes = await prisma.tailoredResume.findMany()
     * 
     * // Get first 10 TailoredResumes
     * const tailoredResumes = await prisma.tailoredResume.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const tailoredResumeWithIdOnly = await prisma.tailoredResume.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends TailoredResumeFindManyArgs>(args?: SelectSubset<T, TailoredResumeFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TailoredResumePayload<ExtArgs>, T, "findMany">>

    /**
     * Create a TailoredResume.
     * @param {TailoredResumeCreateArgs} args - Arguments to create a TailoredResume.
     * @example
     * // Create one TailoredResume
     * const TailoredResume = await prisma.tailoredResume.create({
     *   data: {
     *     // ... data to create a TailoredResume
     *   }
     * })
     * 
     */
    create<T extends TailoredResumeCreateArgs>(args: SelectSubset<T, TailoredResumeCreateArgs<ExtArgs>>): Prisma__TailoredResumeClient<$Result.GetResult<Prisma.$TailoredResumePayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many TailoredResumes.
     * @param {TailoredResumeCreateManyArgs} args - Arguments to create many TailoredResumes.
     * @example
     * // Create many TailoredResumes
     * const tailoredResume = await prisma.tailoredResume.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends TailoredResumeCreateManyArgs>(args?: SelectSubset<T, TailoredResumeCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many TailoredResumes and returns the data saved in the database.
     * @param {TailoredResumeCreateManyAndReturnArgs} args - Arguments to create many TailoredResumes.
     * @example
     * // Create many TailoredResumes
     * const tailoredResume = await prisma.tailoredResume.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many TailoredResumes and only return the `id`
     * const tailoredResumeWithIdOnly = await prisma.tailoredResume.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends TailoredResumeCreateManyAndReturnArgs>(args?: SelectSubset<T, TailoredResumeCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TailoredResumePayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a TailoredResume.
     * @param {TailoredResumeDeleteArgs} args - Arguments to delete one TailoredResume.
     * @example
     * // Delete one TailoredResume
     * const TailoredResume = await prisma.tailoredResume.delete({
     *   where: {
     *     // ... filter to delete one TailoredResume
     *   }
     * })
     * 
     */
    delete<T extends TailoredResumeDeleteArgs>(args: SelectSubset<T, TailoredResumeDeleteArgs<ExtArgs>>): Prisma__TailoredResumeClient<$Result.GetResult<Prisma.$TailoredResumePayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one TailoredResume.
     * @param {TailoredResumeUpdateArgs} args - Arguments to update one TailoredResume.
     * @example
     * // Update one TailoredResume
     * const tailoredResume = await prisma.tailoredResume.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends TailoredResumeUpdateArgs>(args: SelectSubset<T, TailoredResumeUpdateArgs<ExtArgs>>): Prisma__TailoredResumeClient<$Result.GetResult<Prisma.$TailoredResumePayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more TailoredResumes.
     * @param {TailoredResumeDeleteManyArgs} args - Arguments to filter TailoredResumes to delete.
     * @example
     * // Delete a few TailoredResumes
     * const { count } = await prisma.tailoredResume.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends TailoredResumeDeleteManyArgs>(args?: SelectSubset<T, TailoredResumeDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more TailoredResumes.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TailoredResumeUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many TailoredResumes
     * const tailoredResume = await prisma.tailoredResume.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends TailoredResumeUpdateManyArgs>(args: SelectSubset<T, TailoredResumeUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one TailoredResume.
     * @param {TailoredResumeUpsertArgs} args - Arguments to update or create a TailoredResume.
     * @example
     * // Update or create a TailoredResume
     * const tailoredResume = await prisma.tailoredResume.upsert({
     *   create: {
     *     // ... data to create a TailoredResume
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the TailoredResume we want to update
     *   }
     * })
     */
    upsert<T extends TailoredResumeUpsertArgs>(args: SelectSubset<T, TailoredResumeUpsertArgs<ExtArgs>>): Prisma__TailoredResumeClient<$Result.GetResult<Prisma.$TailoredResumePayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of TailoredResumes.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TailoredResumeCountArgs} args - Arguments to filter TailoredResumes to count.
     * @example
     * // Count the number of TailoredResumes
     * const count = await prisma.tailoredResume.count({
     *   where: {
     *     // ... the filter for the TailoredResumes we want to count
     *   }
     * })
    **/
    count<T extends TailoredResumeCountArgs>(
      args?: Subset<T, TailoredResumeCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], TailoredResumeCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a TailoredResume.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TailoredResumeAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends TailoredResumeAggregateArgs>(args: Subset<T, TailoredResumeAggregateArgs>): Prisma.PrismaPromise<GetTailoredResumeAggregateType<T>>

    /**
     * Group by TailoredResume.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TailoredResumeGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends TailoredResumeGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: TailoredResumeGroupByArgs['orderBy'] }
        : { orderBy?: TailoredResumeGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, TailoredResumeGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTailoredResumeGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the TailoredResume model
   */
  readonly fields: TailoredResumeFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for TailoredResume.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__TailoredResumeClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    jobApplication<T extends JobApplicationDefaultArgs<ExtArgs> = {}>(args?: Subset<T, JobApplicationDefaultArgs<ExtArgs>>): Prisma__JobApplicationClient<$Result.GetResult<Prisma.$JobApplicationPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    baseResume<T extends ResumeDefaultArgs<ExtArgs> = {}>(args?: Subset<T, ResumeDefaultArgs<ExtArgs>>): Prisma__ResumeClient<$Result.GetResult<Prisma.$ResumePayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the TailoredResume model
   */ 
  interface TailoredResumeFieldRefs {
    readonly id: FieldRef<"TailoredResume", 'Int'>
    readonly jobApplicationId: FieldRef<"TailoredResume", 'Int'>
    readonly baseResumeId: FieldRef<"TailoredResume", 'Int'>
    readonly llmModel: FieldRef<"TailoredResume", 'String'>
    readonly promptVersion: FieldRef<"TailoredResume", 'String'>
    readonly outputText: FieldRef<"TailoredResume", 'String'>
    readonly createdAt: FieldRef<"TailoredResume", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * TailoredResume findUnique
   */
  export type TailoredResumeFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TailoredResume
     */
    select?: TailoredResumeSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TailoredResumeInclude<ExtArgs> | null
    /**
     * Filter, which TailoredResume to fetch.
     */
    where: TailoredResumeWhereUniqueInput
  }

  /**
   * TailoredResume findUniqueOrThrow
   */
  export type TailoredResumeFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TailoredResume
     */
    select?: TailoredResumeSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TailoredResumeInclude<ExtArgs> | null
    /**
     * Filter, which TailoredResume to fetch.
     */
    where: TailoredResumeWhereUniqueInput
  }

  /**
   * TailoredResume findFirst
   */
  export type TailoredResumeFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TailoredResume
     */
    select?: TailoredResumeSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TailoredResumeInclude<ExtArgs> | null
    /**
     * Filter, which TailoredResume to fetch.
     */
    where?: TailoredResumeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TailoredResumes to fetch.
     */
    orderBy?: TailoredResumeOrderByWithRelationInput | TailoredResumeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for TailoredResumes.
     */
    cursor?: TailoredResumeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TailoredResumes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TailoredResumes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of TailoredResumes.
     */
    distinct?: TailoredResumeScalarFieldEnum | TailoredResumeScalarFieldEnum[]
  }

  /**
   * TailoredResume findFirstOrThrow
   */
  export type TailoredResumeFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TailoredResume
     */
    select?: TailoredResumeSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TailoredResumeInclude<ExtArgs> | null
    /**
     * Filter, which TailoredResume to fetch.
     */
    where?: TailoredResumeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TailoredResumes to fetch.
     */
    orderBy?: TailoredResumeOrderByWithRelationInput | TailoredResumeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for TailoredResumes.
     */
    cursor?: TailoredResumeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TailoredResumes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TailoredResumes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of TailoredResumes.
     */
    distinct?: TailoredResumeScalarFieldEnum | TailoredResumeScalarFieldEnum[]
  }

  /**
   * TailoredResume findMany
   */
  export type TailoredResumeFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TailoredResume
     */
    select?: TailoredResumeSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TailoredResumeInclude<ExtArgs> | null
    /**
     * Filter, which TailoredResumes to fetch.
     */
    where?: TailoredResumeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TailoredResumes to fetch.
     */
    orderBy?: TailoredResumeOrderByWithRelationInput | TailoredResumeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing TailoredResumes.
     */
    cursor?: TailoredResumeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TailoredResumes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TailoredResumes.
     */
    skip?: number
    distinct?: TailoredResumeScalarFieldEnum | TailoredResumeScalarFieldEnum[]
  }

  /**
   * TailoredResume create
   */
  export type TailoredResumeCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TailoredResume
     */
    select?: TailoredResumeSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TailoredResumeInclude<ExtArgs> | null
    /**
     * The data needed to create a TailoredResume.
     */
    data: XOR<TailoredResumeCreateInput, TailoredResumeUncheckedCreateInput>
  }

  /**
   * TailoredResume createMany
   */
  export type TailoredResumeCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many TailoredResumes.
     */
    data: TailoredResumeCreateManyInput | TailoredResumeCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * TailoredResume createManyAndReturn
   */
  export type TailoredResumeCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TailoredResume
     */
    select?: TailoredResumeSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many TailoredResumes.
     */
    data: TailoredResumeCreateManyInput | TailoredResumeCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TailoredResumeIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * TailoredResume update
   */
  export type TailoredResumeUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TailoredResume
     */
    select?: TailoredResumeSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TailoredResumeInclude<ExtArgs> | null
    /**
     * The data needed to update a TailoredResume.
     */
    data: XOR<TailoredResumeUpdateInput, TailoredResumeUncheckedUpdateInput>
    /**
     * Choose, which TailoredResume to update.
     */
    where: TailoredResumeWhereUniqueInput
  }

  /**
   * TailoredResume updateMany
   */
  export type TailoredResumeUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update TailoredResumes.
     */
    data: XOR<TailoredResumeUpdateManyMutationInput, TailoredResumeUncheckedUpdateManyInput>
    /**
     * Filter which TailoredResumes to update
     */
    where?: TailoredResumeWhereInput
  }

  /**
   * TailoredResume upsert
   */
  export type TailoredResumeUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TailoredResume
     */
    select?: TailoredResumeSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TailoredResumeInclude<ExtArgs> | null
    /**
     * The filter to search for the TailoredResume to update in case it exists.
     */
    where: TailoredResumeWhereUniqueInput
    /**
     * In case the TailoredResume found by the `where` argument doesn't exist, create a new TailoredResume with this data.
     */
    create: XOR<TailoredResumeCreateInput, TailoredResumeUncheckedCreateInput>
    /**
     * In case the TailoredResume was found with the provided `where` argument, update it with this data.
     */
    update: XOR<TailoredResumeUpdateInput, TailoredResumeUncheckedUpdateInput>
  }

  /**
   * TailoredResume delete
   */
  export type TailoredResumeDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TailoredResume
     */
    select?: TailoredResumeSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TailoredResumeInclude<ExtArgs> | null
    /**
     * Filter which TailoredResume to delete.
     */
    where: TailoredResumeWhereUniqueInput
  }

  /**
   * TailoredResume deleteMany
   */
  export type TailoredResumeDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which TailoredResumes to delete
     */
    where?: TailoredResumeWhereInput
  }

  /**
   * TailoredResume without action
   */
  export type TailoredResumeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TailoredResume
     */
    select?: TailoredResumeSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TailoredResumeInclude<ExtArgs> | null
  }


  /**
   * Model CoverLetter
   */

  export type AggregateCoverLetter = {
    _count: CoverLetterCountAggregateOutputType | null
    _avg: CoverLetterAvgAggregateOutputType | null
    _sum: CoverLetterSumAggregateOutputType | null
    _min: CoverLetterMinAggregateOutputType | null
    _max: CoverLetterMaxAggregateOutputType | null
  }

  export type CoverLetterAvgAggregateOutputType = {
    id: number | null
    jobApplicationId: number | null
    baseResumeId: number | null
  }

  export type CoverLetterSumAggregateOutputType = {
    id: number | null
    jobApplicationId: number | null
    baseResumeId: number | null
  }

  export type CoverLetterMinAggregateOutputType = {
    id: number | null
    jobApplicationId: number | null
    baseResumeId: number | null
    llmModel: string | null
    promptVersion: string | null
    outputText: string | null
    createdAt: Date | null
  }

  export type CoverLetterMaxAggregateOutputType = {
    id: number | null
    jobApplicationId: number | null
    baseResumeId: number | null
    llmModel: string | null
    promptVersion: string | null
    outputText: string | null
    createdAt: Date | null
  }

  export type CoverLetterCountAggregateOutputType = {
    id: number
    jobApplicationId: number
    baseResumeId: number
    llmModel: number
    promptVersion: number
    outputText: number
    createdAt: number
    _all: number
  }


  export type CoverLetterAvgAggregateInputType = {
    id?: true
    jobApplicationId?: true
    baseResumeId?: true
  }

  export type CoverLetterSumAggregateInputType = {
    id?: true
    jobApplicationId?: true
    baseResumeId?: true
  }

  export type CoverLetterMinAggregateInputType = {
    id?: true
    jobApplicationId?: true
    baseResumeId?: true
    llmModel?: true
    promptVersion?: true
    outputText?: true
    createdAt?: true
  }

  export type CoverLetterMaxAggregateInputType = {
    id?: true
    jobApplicationId?: true
    baseResumeId?: true
    llmModel?: true
    promptVersion?: true
    outputText?: true
    createdAt?: true
  }

  export type CoverLetterCountAggregateInputType = {
    id?: true
    jobApplicationId?: true
    baseResumeId?: true
    llmModel?: true
    promptVersion?: true
    outputText?: true
    createdAt?: true
    _all?: true
  }

  export type CoverLetterAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which CoverLetter to aggregate.
     */
    where?: CoverLetterWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CoverLetters to fetch.
     */
    orderBy?: CoverLetterOrderByWithRelationInput | CoverLetterOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: CoverLetterWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CoverLetters from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CoverLetters.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned CoverLetters
    **/
    _count?: true | CoverLetterCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: CoverLetterAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: CoverLetterSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: CoverLetterMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: CoverLetterMaxAggregateInputType
  }

  export type GetCoverLetterAggregateType<T extends CoverLetterAggregateArgs> = {
        [P in keyof T & keyof AggregateCoverLetter]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateCoverLetter[P]>
      : GetScalarType<T[P], AggregateCoverLetter[P]>
  }




  export type CoverLetterGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CoverLetterWhereInput
    orderBy?: CoverLetterOrderByWithAggregationInput | CoverLetterOrderByWithAggregationInput[]
    by: CoverLetterScalarFieldEnum[] | CoverLetterScalarFieldEnum
    having?: CoverLetterScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: CoverLetterCountAggregateInputType | true
    _avg?: CoverLetterAvgAggregateInputType
    _sum?: CoverLetterSumAggregateInputType
    _min?: CoverLetterMinAggregateInputType
    _max?: CoverLetterMaxAggregateInputType
  }

  export type CoverLetterGroupByOutputType = {
    id: number
    jobApplicationId: number
    baseResumeId: number | null
    llmModel: string
    promptVersion: string
    outputText: string
    createdAt: Date
    _count: CoverLetterCountAggregateOutputType | null
    _avg: CoverLetterAvgAggregateOutputType | null
    _sum: CoverLetterSumAggregateOutputType | null
    _min: CoverLetterMinAggregateOutputType | null
    _max: CoverLetterMaxAggregateOutputType | null
  }

  type GetCoverLetterGroupByPayload<T extends CoverLetterGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<CoverLetterGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof CoverLetterGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], CoverLetterGroupByOutputType[P]>
            : GetScalarType<T[P], CoverLetterGroupByOutputType[P]>
        }
      >
    >


  export type CoverLetterSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    jobApplicationId?: boolean
    baseResumeId?: boolean
    llmModel?: boolean
    promptVersion?: boolean
    outputText?: boolean
    createdAt?: boolean
    jobApplication?: boolean | JobApplicationDefaultArgs<ExtArgs>
    baseResume?: boolean | CoverLetter$baseResumeArgs<ExtArgs>
  }, ExtArgs["result"]["coverLetter"]>

  export type CoverLetterSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    jobApplicationId?: boolean
    baseResumeId?: boolean
    llmModel?: boolean
    promptVersion?: boolean
    outputText?: boolean
    createdAt?: boolean
    jobApplication?: boolean | JobApplicationDefaultArgs<ExtArgs>
    baseResume?: boolean | CoverLetter$baseResumeArgs<ExtArgs>
  }, ExtArgs["result"]["coverLetter"]>

  export type CoverLetterSelectScalar = {
    id?: boolean
    jobApplicationId?: boolean
    baseResumeId?: boolean
    llmModel?: boolean
    promptVersion?: boolean
    outputText?: boolean
    createdAt?: boolean
  }

  export type CoverLetterInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    jobApplication?: boolean | JobApplicationDefaultArgs<ExtArgs>
    baseResume?: boolean | CoverLetter$baseResumeArgs<ExtArgs>
  }
  export type CoverLetterIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    jobApplication?: boolean | JobApplicationDefaultArgs<ExtArgs>
    baseResume?: boolean | CoverLetter$baseResumeArgs<ExtArgs>
  }

  export type $CoverLetterPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "CoverLetter"
    objects: {
      jobApplication: Prisma.$JobApplicationPayload<ExtArgs>
      baseResume: Prisma.$ResumePayload<ExtArgs> | null
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      jobApplicationId: number
      baseResumeId: number | null
      llmModel: string
      promptVersion: string
      outputText: string
      createdAt: Date
    }, ExtArgs["result"]["coverLetter"]>
    composites: {}
  }

  type CoverLetterGetPayload<S extends boolean | null | undefined | CoverLetterDefaultArgs> = $Result.GetResult<Prisma.$CoverLetterPayload, S>

  type CoverLetterCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<CoverLetterFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: CoverLetterCountAggregateInputType | true
    }

  export interface CoverLetterDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['CoverLetter'], meta: { name: 'CoverLetter' } }
    /**
     * Find zero or one CoverLetter that matches the filter.
     * @param {CoverLetterFindUniqueArgs} args - Arguments to find a CoverLetter
     * @example
     * // Get one CoverLetter
     * const coverLetter = await prisma.coverLetter.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends CoverLetterFindUniqueArgs>(args: SelectSubset<T, CoverLetterFindUniqueArgs<ExtArgs>>): Prisma__CoverLetterClient<$Result.GetResult<Prisma.$CoverLetterPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one CoverLetter that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {CoverLetterFindUniqueOrThrowArgs} args - Arguments to find a CoverLetter
     * @example
     * // Get one CoverLetter
     * const coverLetter = await prisma.coverLetter.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends CoverLetterFindUniqueOrThrowArgs>(args: SelectSubset<T, CoverLetterFindUniqueOrThrowArgs<ExtArgs>>): Prisma__CoverLetterClient<$Result.GetResult<Prisma.$CoverLetterPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first CoverLetter that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CoverLetterFindFirstArgs} args - Arguments to find a CoverLetter
     * @example
     * // Get one CoverLetter
     * const coverLetter = await prisma.coverLetter.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends CoverLetterFindFirstArgs>(args?: SelectSubset<T, CoverLetterFindFirstArgs<ExtArgs>>): Prisma__CoverLetterClient<$Result.GetResult<Prisma.$CoverLetterPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first CoverLetter that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CoverLetterFindFirstOrThrowArgs} args - Arguments to find a CoverLetter
     * @example
     * // Get one CoverLetter
     * const coverLetter = await prisma.coverLetter.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends CoverLetterFindFirstOrThrowArgs>(args?: SelectSubset<T, CoverLetterFindFirstOrThrowArgs<ExtArgs>>): Prisma__CoverLetterClient<$Result.GetResult<Prisma.$CoverLetterPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more CoverLetters that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CoverLetterFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all CoverLetters
     * const coverLetters = await prisma.coverLetter.findMany()
     * 
     * // Get first 10 CoverLetters
     * const coverLetters = await prisma.coverLetter.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const coverLetterWithIdOnly = await prisma.coverLetter.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends CoverLetterFindManyArgs>(args?: SelectSubset<T, CoverLetterFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CoverLetterPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a CoverLetter.
     * @param {CoverLetterCreateArgs} args - Arguments to create a CoverLetter.
     * @example
     * // Create one CoverLetter
     * const CoverLetter = await prisma.coverLetter.create({
     *   data: {
     *     // ... data to create a CoverLetter
     *   }
     * })
     * 
     */
    create<T extends CoverLetterCreateArgs>(args: SelectSubset<T, CoverLetterCreateArgs<ExtArgs>>): Prisma__CoverLetterClient<$Result.GetResult<Prisma.$CoverLetterPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many CoverLetters.
     * @param {CoverLetterCreateManyArgs} args - Arguments to create many CoverLetters.
     * @example
     * // Create many CoverLetters
     * const coverLetter = await prisma.coverLetter.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends CoverLetterCreateManyArgs>(args?: SelectSubset<T, CoverLetterCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many CoverLetters and returns the data saved in the database.
     * @param {CoverLetterCreateManyAndReturnArgs} args - Arguments to create many CoverLetters.
     * @example
     * // Create many CoverLetters
     * const coverLetter = await prisma.coverLetter.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many CoverLetters and only return the `id`
     * const coverLetterWithIdOnly = await prisma.coverLetter.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends CoverLetterCreateManyAndReturnArgs>(args?: SelectSubset<T, CoverLetterCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CoverLetterPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a CoverLetter.
     * @param {CoverLetterDeleteArgs} args - Arguments to delete one CoverLetter.
     * @example
     * // Delete one CoverLetter
     * const CoverLetter = await prisma.coverLetter.delete({
     *   where: {
     *     // ... filter to delete one CoverLetter
     *   }
     * })
     * 
     */
    delete<T extends CoverLetterDeleteArgs>(args: SelectSubset<T, CoverLetterDeleteArgs<ExtArgs>>): Prisma__CoverLetterClient<$Result.GetResult<Prisma.$CoverLetterPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one CoverLetter.
     * @param {CoverLetterUpdateArgs} args - Arguments to update one CoverLetter.
     * @example
     * // Update one CoverLetter
     * const coverLetter = await prisma.coverLetter.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends CoverLetterUpdateArgs>(args: SelectSubset<T, CoverLetterUpdateArgs<ExtArgs>>): Prisma__CoverLetterClient<$Result.GetResult<Prisma.$CoverLetterPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more CoverLetters.
     * @param {CoverLetterDeleteManyArgs} args - Arguments to filter CoverLetters to delete.
     * @example
     * // Delete a few CoverLetters
     * const { count } = await prisma.coverLetter.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends CoverLetterDeleteManyArgs>(args?: SelectSubset<T, CoverLetterDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more CoverLetters.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CoverLetterUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many CoverLetters
     * const coverLetter = await prisma.coverLetter.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends CoverLetterUpdateManyArgs>(args: SelectSubset<T, CoverLetterUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one CoverLetter.
     * @param {CoverLetterUpsertArgs} args - Arguments to update or create a CoverLetter.
     * @example
     * // Update or create a CoverLetter
     * const coverLetter = await prisma.coverLetter.upsert({
     *   create: {
     *     // ... data to create a CoverLetter
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the CoverLetter we want to update
     *   }
     * })
     */
    upsert<T extends CoverLetterUpsertArgs>(args: SelectSubset<T, CoverLetterUpsertArgs<ExtArgs>>): Prisma__CoverLetterClient<$Result.GetResult<Prisma.$CoverLetterPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of CoverLetters.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CoverLetterCountArgs} args - Arguments to filter CoverLetters to count.
     * @example
     * // Count the number of CoverLetters
     * const count = await prisma.coverLetter.count({
     *   where: {
     *     // ... the filter for the CoverLetters we want to count
     *   }
     * })
    **/
    count<T extends CoverLetterCountArgs>(
      args?: Subset<T, CoverLetterCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], CoverLetterCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a CoverLetter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CoverLetterAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends CoverLetterAggregateArgs>(args: Subset<T, CoverLetterAggregateArgs>): Prisma.PrismaPromise<GetCoverLetterAggregateType<T>>

    /**
     * Group by CoverLetter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CoverLetterGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends CoverLetterGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: CoverLetterGroupByArgs['orderBy'] }
        : { orderBy?: CoverLetterGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, CoverLetterGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetCoverLetterGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the CoverLetter model
   */
  readonly fields: CoverLetterFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for CoverLetter.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__CoverLetterClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    jobApplication<T extends JobApplicationDefaultArgs<ExtArgs> = {}>(args?: Subset<T, JobApplicationDefaultArgs<ExtArgs>>): Prisma__JobApplicationClient<$Result.GetResult<Prisma.$JobApplicationPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    baseResume<T extends CoverLetter$baseResumeArgs<ExtArgs> = {}>(args?: Subset<T, CoverLetter$baseResumeArgs<ExtArgs>>): Prisma__ResumeClient<$Result.GetResult<Prisma.$ResumePayload<ExtArgs>, T, "findUniqueOrThrow"> | null, null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the CoverLetter model
   */ 
  interface CoverLetterFieldRefs {
    readonly id: FieldRef<"CoverLetter", 'Int'>
    readonly jobApplicationId: FieldRef<"CoverLetter", 'Int'>
    readonly baseResumeId: FieldRef<"CoverLetter", 'Int'>
    readonly llmModel: FieldRef<"CoverLetter", 'String'>
    readonly promptVersion: FieldRef<"CoverLetter", 'String'>
    readonly outputText: FieldRef<"CoverLetter", 'String'>
    readonly createdAt: FieldRef<"CoverLetter", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * CoverLetter findUnique
   */
  export type CoverLetterFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CoverLetter
     */
    select?: CoverLetterSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CoverLetterInclude<ExtArgs> | null
    /**
     * Filter, which CoverLetter to fetch.
     */
    where: CoverLetterWhereUniqueInput
  }

  /**
   * CoverLetter findUniqueOrThrow
   */
  export type CoverLetterFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CoverLetter
     */
    select?: CoverLetterSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CoverLetterInclude<ExtArgs> | null
    /**
     * Filter, which CoverLetter to fetch.
     */
    where: CoverLetterWhereUniqueInput
  }

  /**
   * CoverLetter findFirst
   */
  export type CoverLetterFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CoverLetter
     */
    select?: CoverLetterSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CoverLetterInclude<ExtArgs> | null
    /**
     * Filter, which CoverLetter to fetch.
     */
    where?: CoverLetterWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CoverLetters to fetch.
     */
    orderBy?: CoverLetterOrderByWithRelationInput | CoverLetterOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for CoverLetters.
     */
    cursor?: CoverLetterWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CoverLetters from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CoverLetters.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CoverLetters.
     */
    distinct?: CoverLetterScalarFieldEnum | CoverLetterScalarFieldEnum[]
  }

  /**
   * CoverLetter findFirstOrThrow
   */
  export type CoverLetterFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CoverLetter
     */
    select?: CoverLetterSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CoverLetterInclude<ExtArgs> | null
    /**
     * Filter, which CoverLetter to fetch.
     */
    where?: CoverLetterWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CoverLetters to fetch.
     */
    orderBy?: CoverLetterOrderByWithRelationInput | CoverLetterOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for CoverLetters.
     */
    cursor?: CoverLetterWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CoverLetters from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CoverLetters.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CoverLetters.
     */
    distinct?: CoverLetterScalarFieldEnum | CoverLetterScalarFieldEnum[]
  }

  /**
   * CoverLetter findMany
   */
  export type CoverLetterFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CoverLetter
     */
    select?: CoverLetterSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CoverLetterInclude<ExtArgs> | null
    /**
     * Filter, which CoverLetters to fetch.
     */
    where?: CoverLetterWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CoverLetters to fetch.
     */
    orderBy?: CoverLetterOrderByWithRelationInput | CoverLetterOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing CoverLetters.
     */
    cursor?: CoverLetterWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CoverLetters from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CoverLetters.
     */
    skip?: number
    distinct?: CoverLetterScalarFieldEnum | CoverLetterScalarFieldEnum[]
  }

  /**
   * CoverLetter create
   */
  export type CoverLetterCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CoverLetter
     */
    select?: CoverLetterSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CoverLetterInclude<ExtArgs> | null
    /**
     * The data needed to create a CoverLetter.
     */
    data: XOR<CoverLetterCreateInput, CoverLetterUncheckedCreateInput>
  }

  /**
   * CoverLetter createMany
   */
  export type CoverLetterCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many CoverLetters.
     */
    data: CoverLetterCreateManyInput | CoverLetterCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * CoverLetter createManyAndReturn
   */
  export type CoverLetterCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CoverLetter
     */
    select?: CoverLetterSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many CoverLetters.
     */
    data: CoverLetterCreateManyInput | CoverLetterCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CoverLetterIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * CoverLetter update
   */
  export type CoverLetterUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CoverLetter
     */
    select?: CoverLetterSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CoverLetterInclude<ExtArgs> | null
    /**
     * The data needed to update a CoverLetter.
     */
    data: XOR<CoverLetterUpdateInput, CoverLetterUncheckedUpdateInput>
    /**
     * Choose, which CoverLetter to update.
     */
    where: CoverLetterWhereUniqueInput
  }

  /**
   * CoverLetter updateMany
   */
  export type CoverLetterUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update CoverLetters.
     */
    data: XOR<CoverLetterUpdateManyMutationInput, CoverLetterUncheckedUpdateManyInput>
    /**
     * Filter which CoverLetters to update
     */
    where?: CoverLetterWhereInput
  }

  /**
   * CoverLetter upsert
   */
  export type CoverLetterUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CoverLetter
     */
    select?: CoverLetterSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CoverLetterInclude<ExtArgs> | null
    /**
     * The filter to search for the CoverLetter to update in case it exists.
     */
    where: CoverLetterWhereUniqueInput
    /**
     * In case the CoverLetter found by the `where` argument doesn't exist, create a new CoverLetter with this data.
     */
    create: XOR<CoverLetterCreateInput, CoverLetterUncheckedCreateInput>
    /**
     * In case the CoverLetter was found with the provided `where` argument, update it with this data.
     */
    update: XOR<CoverLetterUpdateInput, CoverLetterUncheckedUpdateInput>
  }

  /**
   * CoverLetter delete
   */
  export type CoverLetterDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CoverLetter
     */
    select?: CoverLetterSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CoverLetterInclude<ExtArgs> | null
    /**
     * Filter which CoverLetter to delete.
     */
    where: CoverLetterWhereUniqueInput
  }

  /**
   * CoverLetter deleteMany
   */
  export type CoverLetterDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which CoverLetters to delete
     */
    where?: CoverLetterWhereInput
  }

  /**
   * CoverLetter.baseResume
   */
  export type CoverLetter$baseResumeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Resume
     */
    select?: ResumeSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ResumeInclude<ExtArgs> | null
    where?: ResumeWhereInput
  }

  /**
   * CoverLetter without action
   */
  export type CoverLetterDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CoverLetter
     */
    select?: CoverLetterSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CoverLetterInclude<ExtArgs> | null
  }


  /**
   * Model AppConfig
   */

  export type AggregateAppConfig = {
    _count: AppConfigCountAggregateOutputType | null
    _min: AppConfigMinAggregateOutputType | null
    _max: AppConfigMaxAggregateOutputType | null
  }

  export type AppConfigMinAggregateOutputType = {
    key: string | null
    value: string | null
    updatedAt: Date | null
  }

  export type AppConfigMaxAggregateOutputType = {
    key: string | null
    value: string | null
    updatedAt: Date | null
  }

  export type AppConfigCountAggregateOutputType = {
    key: number
    value: number
    updatedAt: number
    _all: number
  }


  export type AppConfigMinAggregateInputType = {
    key?: true
    value?: true
    updatedAt?: true
  }

  export type AppConfigMaxAggregateInputType = {
    key?: true
    value?: true
    updatedAt?: true
  }

  export type AppConfigCountAggregateInputType = {
    key?: true
    value?: true
    updatedAt?: true
    _all?: true
  }

  export type AppConfigAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AppConfig to aggregate.
     */
    where?: AppConfigWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AppConfigs to fetch.
     */
    orderBy?: AppConfigOrderByWithRelationInput | AppConfigOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: AppConfigWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AppConfigs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AppConfigs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned AppConfigs
    **/
    _count?: true | AppConfigCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: AppConfigMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: AppConfigMaxAggregateInputType
  }

  export type GetAppConfigAggregateType<T extends AppConfigAggregateArgs> = {
        [P in keyof T & keyof AggregateAppConfig]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateAppConfig[P]>
      : GetScalarType<T[P], AggregateAppConfig[P]>
  }




  export type AppConfigGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AppConfigWhereInput
    orderBy?: AppConfigOrderByWithAggregationInput | AppConfigOrderByWithAggregationInput[]
    by: AppConfigScalarFieldEnum[] | AppConfigScalarFieldEnum
    having?: AppConfigScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: AppConfigCountAggregateInputType | true
    _min?: AppConfigMinAggregateInputType
    _max?: AppConfigMaxAggregateInputType
  }

  export type AppConfigGroupByOutputType = {
    key: string
    value: string
    updatedAt: Date
    _count: AppConfigCountAggregateOutputType | null
    _min: AppConfigMinAggregateOutputType | null
    _max: AppConfigMaxAggregateOutputType | null
  }

  type GetAppConfigGroupByPayload<T extends AppConfigGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<AppConfigGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof AppConfigGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], AppConfigGroupByOutputType[P]>
            : GetScalarType<T[P], AppConfigGroupByOutputType[P]>
        }
      >
    >


  export type AppConfigSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    key?: boolean
    value?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["appConfig"]>

  export type AppConfigSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    key?: boolean
    value?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["appConfig"]>

  export type AppConfigSelectScalar = {
    key?: boolean
    value?: boolean
    updatedAt?: boolean
  }


  export type $AppConfigPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "AppConfig"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      key: string
      value: string
      updatedAt: Date
    }, ExtArgs["result"]["appConfig"]>
    composites: {}
  }

  type AppConfigGetPayload<S extends boolean | null | undefined | AppConfigDefaultArgs> = $Result.GetResult<Prisma.$AppConfigPayload, S>

  type AppConfigCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<AppConfigFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: AppConfigCountAggregateInputType | true
    }

  export interface AppConfigDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['AppConfig'], meta: { name: 'AppConfig' } }
    /**
     * Find zero or one AppConfig that matches the filter.
     * @param {AppConfigFindUniqueArgs} args - Arguments to find a AppConfig
     * @example
     * // Get one AppConfig
     * const appConfig = await prisma.appConfig.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends AppConfigFindUniqueArgs>(args: SelectSubset<T, AppConfigFindUniqueArgs<ExtArgs>>): Prisma__AppConfigClient<$Result.GetResult<Prisma.$AppConfigPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one AppConfig that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {AppConfigFindUniqueOrThrowArgs} args - Arguments to find a AppConfig
     * @example
     * // Get one AppConfig
     * const appConfig = await prisma.appConfig.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends AppConfigFindUniqueOrThrowArgs>(args: SelectSubset<T, AppConfigFindUniqueOrThrowArgs<ExtArgs>>): Prisma__AppConfigClient<$Result.GetResult<Prisma.$AppConfigPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first AppConfig that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AppConfigFindFirstArgs} args - Arguments to find a AppConfig
     * @example
     * // Get one AppConfig
     * const appConfig = await prisma.appConfig.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends AppConfigFindFirstArgs>(args?: SelectSubset<T, AppConfigFindFirstArgs<ExtArgs>>): Prisma__AppConfigClient<$Result.GetResult<Prisma.$AppConfigPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first AppConfig that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AppConfigFindFirstOrThrowArgs} args - Arguments to find a AppConfig
     * @example
     * // Get one AppConfig
     * const appConfig = await prisma.appConfig.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends AppConfigFindFirstOrThrowArgs>(args?: SelectSubset<T, AppConfigFindFirstOrThrowArgs<ExtArgs>>): Prisma__AppConfigClient<$Result.GetResult<Prisma.$AppConfigPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more AppConfigs that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AppConfigFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all AppConfigs
     * const appConfigs = await prisma.appConfig.findMany()
     * 
     * // Get first 10 AppConfigs
     * const appConfigs = await prisma.appConfig.findMany({ take: 10 })
     * 
     * // Only select the `key`
     * const appConfigWithKeyOnly = await prisma.appConfig.findMany({ select: { key: true } })
     * 
     */
    findMany<T extends AppConfigFindManyArgs>(args?: SelectSubset<T, AppConfigFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AppConfigPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a AppConfig.
     * @param {AppConfigCreateArgs} args - Arguments to create a AppConfig.
     * @example
     * // Create one AppConfig
     * const AppConfig = await prisma.appConfig.create({
     *   data: {
     *     // ... data to create a AppConfig
     *   }
     * })
     * 
     */
    create<T extends AppConfigCreateArgs>(args: SelectSubset<T, AppConfigCreateArgs<ExtArgs>>): Prisma__AppConfigClient<$Result.GetResult<Prisma.$AppConfigPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many AppConfigs.
     * @param {AppConfigCreateManyArgs} args - Arguments to create many AppConfigs.
     * @example
     * // Create many AppConfigs
     * const appConfig = await prisma.appConfig.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends AppConfigCreateManyArgs>(args?: SelectSubset<T, AppConfigCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many AppConfigs and returns the data saved in the database.
     * @param {AppConfigCreateManyAndReturnArgs} args - Arguments to create many AppConfigs.
     * @example
     * // Create many AppConfigs
     * const appConfig = await prisma.appConfig.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many AppConfigs and only return the `key`
     * const appConfigWithKeyOnly = await prisma.appConfig.createManyAndReturn({ 
     *   select: { key: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends AppConfigCreateManyAndReturnArgs>(args?: SelectSubset<T, AppConfigCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AppConfigPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a AppConfig.
     * @param {AppConfigDeleteArgs} args - Arguments to delete one AppConfig.
     * @example
     * // Delete one AppConfig
     * const AppConfig = await prisma.appConfig.delete({
     *   where: {
     *     // ... filter to delete one AppConfig
     *   }
     * })
     * 
     */
    delete<T extends AppConfigDeleteArgs>(args: SelectSubset<T, AppConfigDeleteArgs<ExtArgs>>): Prisma__AppConfigClient<$Result.GetResult<Prisma.$AppConfigPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one AppConfig.
     * @param {AppConfigUpdateArgs} args - Arguments to update one AppConfig.
     * @example
     * // Update one AppConfig
     * const appConfig = await prisma.appConfig.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends AppConfigUpdateArgs>(args: SelectSubset<T, AppConfigUpdateArgs<ExtArgs>>): Prisma__AppConfigClient<$Result.GetResult<Prisma.$AppConfigPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more AppConfigs.
     * @param {AppConfigDeleteManyArgs} args - Arguments to filter AppConfigs to delete.
     * @example
     * // Delete a few AppConfigs
     * const { count } = await prisma.appConfig.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends AppConfigDeleteManyArgs>(args?: SelectSubset<T, AppConfigDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more AppConfigs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AppConfigUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many AppConfigs
     * const appConfig = await prisma.appConfig.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends AppConfigUpdateManyArgs>(args: SelectSubset<T, AppConfigUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one AppConfig.
     * @param {AppConfigUpsertArgs} args - Arguments to update or create a AppConfig.
     * @example
     * // Update or create a AppConfig
     * const appConfig = await prisma.appConfig.upsert({
     *   create: {
     *     // ... data to create a AppConfig
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the AppConfig we want to update
     *   }
     * })
     */
    upsert<T extends AppConfigUpsertArgs>(args: SelectSubset<T, AppConfigUpsertArgs<ExtArgs>>): Prisma__AppConfigClient<$Result.GetResult<Prisma.$AppConfigPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of AppConfigs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AppConfigCountArgs} args - Arguments to filter AppConfigs to count.
     * @example
     * // Count the number of AppConfigs
     * const count = await prisma.appConfig.count({
     *   where: {
     *     // ... the filter for the AppConfigs we want to count
     *   }
     * })
    **/
    count<T extends AppConfigCountArgs>(
      args?: Subset<T, AppConfigCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], AppConfigCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a AppConfig.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AppConfigAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends AppConfigAggregateArgs>(args: Subset<T, AppConfigAggregateArgs>): Prisma.PrismaPromise<GetAppConfigAggregateType<T>>

    /**
     * Group by AppConfig.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AppConfigGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends AppConfigGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: AppConfigGroupByArgs['orderBy'] }
        : { orderBy?: AppConfigGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, AppConfigGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetAppConfigGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the AppConfig model
   */
  readonly fields: AppConfigFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for AppConfig.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__AppConfigClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the AppConfig model
   */ 
  interface AppConfigFieldRefs {
    readonly key: FieldRef<"AppConfig", 'String'>
    readonly value: FieldRef<"AppConfig", 'String'>
    readonly updatedAt: FieldRef<"AppConfig", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * AppConfig findUnique
   */
  export type AppConfigFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AppConfig
     */
    select?: AppConfigSelect<ExtArgs> | null
    /**
     * Filter, which AppConfig to fetch.
     */
    where: AppConfigWhereUniqueInput
  }

  /**
   * AppConfig findUniqueOrThrow
   */
  export type AppConfigFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AppConfig
     */
    select?: AppConfigSelect<ExtArgs> | null
    /**
     * Filter, which AppConfig to fetch.
     */
    where: AppConfigWhereUniqueInput
  }

  /**
   * AppConfig findFirst
   */
  export type AppConfigFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AppConfig
     */
    select?: AppConfigSelect<ExtArgs> | null
    /**
     * Filter, which AppConfig to fetch.
     */
    where?: AppConfigWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AppConfigs to fetch.
     */
    orderBy?: AppConfigOrderByWithRelationInput | AppConfigOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AppConfigs.
     */
    cursor?: AppConfigWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AppConfigs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AppConfigs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AppConfigs.
     */
    distinct?: AppConfigScalarFieldEnum | AppConfigScalarFieldEnum[]
  }

  /**
   * AppConfig findFirstOrThrow
   */
  export type AppConfigFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AppConfig
     */
    select?: AppConfigSelect<ExtArgs> | null
    /**
     * Filter, which AppConfig to fetch.
     */
    where?: AppConfigWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AppConfigs to fetch.
     */
    orderBy?: AppConfigOrderByWithRelationInput | AppConfigOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AppConfigs.
     */
    cursor?: AppConfigWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AppConfigs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AppConfigs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AppConfigs.
     */
    distinct?: AppConfigScalarFieldEnum | AppConfigScalarFieldEnum[]
  }

  /**
   * AppConfig findMany
   */
  export type AppConfigFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AppConfig
     */
    select?: AppConfigSelect<ExtArgs> | null
    /**
     * Filter, which AppConfigs to fetch.
     */
    where?: AppConfigWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AppConfigs to fetch.
     */
    orderBy?: AppConfigOrderByWithRelationInput | AppConfigOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing AppConfigs.
     */
    cursor?: AppConfigWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AppConfigs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AppConfigs.
     */
    skip?: number
    distinct?: AppConfigScalarFieldEnum | AppConfigScalarFieldEnum[]
  }

  /**
   * AppConfig create
   */
  export type AppConfigCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AppConfig
     */
    select?: AppConfigSelect<ExtArgs> | null
    /**
     * The data needed to create a AppConfig.
     */
    data: XOR<AppConfigCreateInput, AppConfigUncheckedCreateInput>
  }

  /**
   * AppConfig createMany
   */
  export type AppConfigCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many AppConfigs.
     */
    data: AppConfigCreateManyInput | AppConfigCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * AppConfig createManyAndReturn
   */
  export type AppConfigCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AppConfig
     */
    select?: AppConfigSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many AppConfigs.
     */
    data: AppConfigCreateManyInput | AppConfigCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * AppConfig update
   */
  export type AppConfigUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AppConfig
     */
    select?: AppConfigSelect<ExtArgs> | null
    /**
     * The data needed to update a AppConfig.
     */
    data: XOR<AppConfigUpdateInput, AppConfigUncheckedUpdateInput>
    /**
     * Choose, which AppConfig to update.
     */
    where: AppConfigWhereUniqueInput
  }

  /**
   * AppConfig updateMany
   */
  export type AppConfigUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update AppConfigs.
     */
    data: XOR<AppConfigUpdateManyMutationInput, AppConfigUncheckedUpdateManyInput>
    /**
     * Filter which AppConfigs to update
     */
    where?: AppConfigWhereInput
  }

  /**
   * AppConfig upsert
   */
  export type AppConfigUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AppConfig
     */
    select?: AppConfigSelect<ExtArgs> | null
    /**
     * The filter to search for the AppConfig to update in case it exists.
     */
    where: AppConfigWhereUniqueInput
    /**
     * In case the AppConfig found by the `where` argument doesn't exist, create a new AppConfig with this data.
     */
    create: XOR<AppConfigCreateInput, AppConfigUncheckedCreateInput>
    /**
     * In case the AppConfig was found with the provided `where` argument, update it with this data.
     */
    update: XOR<AppConfigUpdateInput, AppConfigUncheckedUpdateInput>
  }

  /**
   * AppConfig delete
   */
  export type AppConfigDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AppConfig
     */
    select?: AppConfigSelect<ExtArgs> | null
    /**
     * Filter which AppConfig to delete.
     */
    where: AppConfigWhereUniqueInput
  }

  /**
   * AppConfig deleteMany
   */
  export type AppConfigDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AppConfigs to delete
     */
    where?: AppConfigWhereInput
  }

  /**
   * AppConfig without action
   */
  export type AppConfigDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AppConfig
     */
    select?: AppConfigSelect<ExtArgs> | null
  }


  /**
   * Model SkipRule
   */

  export type AggregateSkipRule = {
    _count: SkipRuleCountAggregateOutputType | null
    _avg: SkipRuleAvgAggregateOutputType | null
    _sum: SkipRuleSumAggregateOutputType | null
    _min: SkipRuleMinAggregateOutputType | null
    _max: SkipRuleMaxAggregateOutputType | null
  }

  export type SkipRuleAvgAggregateOutputType = {
    id: number | null
  }

  export type SkipRuleSumAggregateOutputType = {
    id: number | null
  }

  export type SkipRuleMinAggregateOutputType = {
    id: number | null
    type: $Enums.SkipRuleType | null
    pattern: string | null
    active: boolean | null
    createdAt: Date | null
  }

  export type SkipRuleMaxAggregateOutputType = {
    id: number | null
    type: $Enums.SkipRuleType | null
    pattern: string | null
    active: boolean | null
    createdAt: Date | null
  }

  export type SkipRuleCountAggregateOutputType = {
    id: number
    type: number
    pattern: number
    active: number
    createdAt: number
    _all: number
  }


  export type SkipRuleAvgAggregateInputType = {
    id?: true
  }

  export type SkipRuleSumAggregateInputType = {
    id?: true
  }

  export type SkipRuleMinAggregateInputType = {
    id?: true
    type?: true
    pattern?: true
    active?: true
    createdAt?: true
  }

  export type SkipRuleMaxAggregateInputType = {
    id?: true
    type?: true
    pattern?: true
    active?: true
    createdAt?: true
  }

  export type SkipRuleCountAggregateInputType = {
    id?: true
    type?: true
    pattern?: true
    active?: true
    createdAt?: true
    _all?: true
  }

  export type SkipRuleAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which SkipRule to aggregate.
     */
    where?: SkipRuleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SkipRules to fetch.
     */
    orderBy?: SkipRuleOrderByWithRelationInput | SkipRuleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: SkipRuleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SkipRules from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SkipRules.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned SkipRules
    **/
    _count?: true | SkipRuleCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: SkipRuleAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: SkipRuleSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: SkipRuleMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: SkipRuleMaxAggregateInputType
  }

  export type GetSkipRuleAggregateType<T extends SkipRuleAggregateArgs> = {
        [P in keyof T & keyof AggregateSkipRule]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateSkipRule[P]>
      : GetScalarType<T[P], AggregateSkipRule[P]>
  }




  export type SkipRuleGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SkipRuleWhereInput
    orderBy?: SkipRuleOrderByWithAggregationInput | SkipRuleOrderByWithAggregationInput[]
    by: SkipRuleScalarFieldEnum[] | SkipRuleScalarFieldEnum
    having?: SkipRuleScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: SkipRuleCountAggregateInputType | true
    _avg?: SkipRuleAvgAggregateInputType
    _sum?: SkipRuleSumAggregateInputType
    _min?: SkipRuleMinAggregateInputType
    _max?: SkipRuleMaxAggregateInputType
  }

  export type SkipRuleGroupByOutputType = {
    id: number
    type: $Enums.SkipRuleType
    pattern: string
    active: boolean
    createdAt: Date
    _count: SkipRuleCountAggregateOutputType | null
    _avg: SkipRuleAvgAggregateOutputType | null
    _sum: SkipRuleSumAggregateOutputType | null
    _min: SkipRuleMinAggregateOutputType | null
    _max: SkipRuleMaxAggregateOutputType | null
  }

  type GetSkipRuleGroupByPayload<T extends SkipRuleGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<SkipRuleGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof SkipRuleGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], SkipRuleGroupByOutputType[P]>
            : GetScalarType<T[P], SkipRuleGroupByOutputType[P]>
        }
      >
    >


  export type SkipRuleSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    type?: boolean
    pattern?: boolean
    active?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["skipRule"]>

  export type SkipRuleSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    type?: boolean
    pattern?: boolean
    active?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["skipRule"]>

  export type SkipRuleSelectScalar = {
    id?: boolean
    type?: boolean
    pattern?: boolean
    active?: boolean
    createdAt?: boolean
  }


  export type $SkipRulePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "SkipRule"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: number
      type: $Enums.SkipRuleType
      pattern: string
      active: boolean
      createdAt: Date
    }, ExtArgs["result"]["skipRule"]>
    composites: {}
  }

  type SkipRuleGetPayload<S extends boolean | null | undefined | SkipRuleDefaultArgs> = $Result.GetResult<Prisma.$SkipRulePayload, S>

  type SkipRuleCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<SkipRuleFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: SkipRuleCountAggregateInputType | true
    }

  export interface SkipRuleDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['SkipRule'], meta: { name: 'SkipRule' } }
    /**
     * Find zero or one SkipRule that matches the filter.
     * @param {SkipRuleFindUniqueArgs} args - Arguments to find a SkipRule
     * @example
     * // Get one SkipRule
     * const skipRule = await prisma.skipRule.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends SkipRuleFindUniqueArgs>(args: SelectSubset<T, SkipRuleFindUniqueArgs<ExtArgs>>): Prisma__SkipRuleClient<$Result.GetResult<Prisma.$SkipRulePayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one SkipRule that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {SkipRuleFindUniqueOrThrowArgs} args - Arguments to find a SkipRule
     * @example
     * // Get one SkipRule
     * const skipRule = await prisma.skipRule.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends SkipRuleFindUniqueOrThrowArgs>(args: SelectSubset<T, SkipRuleFindUniqueOrThrowArgs<ExtArgs>>): Prisma__SkipRuleClient<$Result.GetResult<Prisma.$SkipRulePayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first SkipRule that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SkipRuleFindFirstArgs} args - Arguments to find a SkipRule
     * @example
     * // Get one SkipRule
     * const skipRule = await prisma.skipRule.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends SkipRuleFindFirstArgs>(args?: SelectSubset<T, SkipRuleFindFirstArgs<ExtArgs>>): Prisma__SkipRuleClient<$Result.GetResult<Prisma.$SkipRulePayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first SkipRule that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SkipRuleFindFirstOrThrowArgs} args - Arguments to find a SkipRule
     * @example
     * // Get one SkipRule
     * const skipRule = await prisma.skipRule.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends SkipRuleFindFirstOrThrowArgs>(args?: SelectSubset<T, SkipRuleFindFirstOrThrowArgs<ExtArgs>>): Prisma__SkipRuleClient<$Result.GetResult<Prisma.$SkipRulePayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more SkipRules that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SkipRuleFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all SkipRules
     * const skipRules = await prisma.skipRule.findMany()
     * 
     * // Get first 10 SkipRules
     * const skipRules = await prisma.skipRule.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const skipRuleWithIdOnly = await prisma.skipRule.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends SkipRuleFindManyArgs>(args?: SelectSubset<T, SkipRuleFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SkipRulePayload<ExtArgs>, T, "findMany">>

    /**
     * Create a SkipRule.
     * @param {SkipRuleCreateArgs} args - Arguments to create a SkipRule.
     * @example
     * // Create one SkipRule
     * const SkipRule = await prisma.skipRule.create({
     *   data: {
     *     // ... data to create a SkipRule
     *   }
     * })
     * 
     */
    create<T extends SkipRuleCreateArgs>(args: SelectSubset<T, SkipRuleCreateArgs<ExtArgs>>): Prisma__SkipRuleClient<$Result.GetResult<Prisma.$SkipRulePayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many SkipRules.
     * @param {SkipRuleCreateManyArgs} args - Arguments to create many SkipRules.
     * @example
     * // Create many SkipRules
     * const skipRule = await prisma.skipRule.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends SkipRuleCreateManyArgs>(args?: SelectSubset<T, SkipRuleCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many SkipRules and returns the data saved in the database.
     * @param {SkipRuleCreateManyAndReturnArgs} args - Arguments to create many SkipRules.
     * @example
     * // Create many SkipRules
     * const skipRule = await prisma.skipRule.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many SkipRules and only return the `id`
     * const skipRuleWithIdOnly = await prisma.skipRule.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends SkipRuleCreateManyAndReturnArgs>(args?: SelectSubset<T, SkipRuleCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SkipRulePayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a SkipRule.
     * @param {SkipRuleDeleteArgs} args - Arguments to delete one SkipRule.
     * @example
     * // Delete one SkipRule
     * const SkipRule = await prisma.skipRule.delete({
     *   where: {
     *     // ... filter to delete one SkipRule
     *   }
     * })
     * 
     */
    delete<T extends SkipRuleDeleteArgs>(args: SelectSubset<T, SkipRuleDeleteArgs<ExtArgs>>): Prisma__SkipRuleClient<$Result.GetResult<Prisma.$SkipRulePayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one SkipRule.
     * @param {SkipRuleUpdateArgs} args - Arguments to update one SkipRule.
     * @example
     * // Update one SkipRule
     * const skipRule = await prisma.skipRule.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends SkipRuleUpdateArgs>(args: SelectSubset<T, SkipRuleUpdateArgs<ExtArgs>>): Prisma__SkipRuleClient<$Result.GetResult<Prisma.$SkipRulePayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more SkipRules.
     * @param {SkipRuleDeleteManyArgs} args - Arguments to filter SkipRules to delete.
     * @example
     * // Delete a few SkipRules
     * const { count } = await prisma.skipRule.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends SkipRuleDeleteManyArgs>(args?: SelectSubset<T, SkipRuleDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more SkipRules.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SkipRuleUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many SkipRules
     * const skipRule = await prisma.skipRule.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends SkipRuleUpdateManyArgs>(args: SelectSubset<T, SkipRuleUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one SkipRule.
     * @param {SkipRuleUpsertArgs} args - Arguments to update or create a SkipRule.
     * @example
     * // Update or create a SkipRule
     * const skipRule = await prisma.skipRule.upsert({
     *   create: {
     *     // ... data to create a SkipRule
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the SkipRule we want to update
     *   }
     * })
     */
    upsert<T extends SkipRuleUpsertArgs>(args: SelectSubset<T, SkipRuleUpsertArgs<ExtArgs>>): Prisma__SkipRuleClient<$Result.GetResult<Prisma.$SkipRulePayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of SkipRules.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SkipRuleCountArgs} args - Arguments to filter SkipRules to count.
     * @example
     * // Count the number of SkipRules
     * const count = await prisma.skipRule.count({
     *   where: {
     *     // ... the filter for the SkipRules we want to count
     *   }
     * })
    **/
    count<T extends SkipRuleCountArgs>(
      args?: Subset<T, SkipRuleCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], SkipRuleCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a SkipRule.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SkipRuleAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends SkipRuleAggregateArgs>(args: Subset<T, SkipRuleAggregateArgs>): Prisma.PrismaPromise<GetSkipRuleAggregateType<T>>

    /**
     * Group by SkipRule.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SkipRuleGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends SkipRuleGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: SkipRuleGroupByArgs['orderBy'] }
        : { orderBy?: SkipRuleGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, SkipRuleGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetSkipRuleGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the SkipRule model
   */
  readonly fields: SkipRuleFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for SkipRule.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__SkipRuleClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the SkipRule model
   */ 
  interface SkipRuleFieldRefs {
    readonly id: FieldRef<"SkipRule", 'Int'>
    readonly type: FieldRef<"SkipRule", 'SkipRuleType'>
    readonly pattern: FieldRef<"SkipRule", 'String'>
    readonly active: FieldRef<"SkipRule", 'Boolean'>
    readonly createdAt: FieldRef<"SkipRule", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * SkipRule findUnique
   */
  export type SkipRuleFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SkipRule
     */
    select?: SkipRuleSelect<ExtArgs> | null
    /**
     * Filter, which SkipRule to fetch.
     */
    where: SkipRuleWhereUniqueInput
  }

  /**
   * SkipRule findUniqueOrThrow
   */
  export type SkipRuleFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SkipRule
     */
    select?: SkipRuleSelect<ExtArgs> | null
    /**
     * Filter, which SkipRule to fetch.
     */
    where: SkipRuleWhereUniqueInput
  }

  /**
   * SkipRule findFirst
   */
  export type SkipRuleFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SkipRule
     */
    select?: SkipRuleSelect<ExtArgs> | null
    /**
     * Filter, which SkipRule to fetch.
     */
    where?: SkipRuleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SkipRules to fetch.
     */
    orderBy?: SkipRuleOrderByWithRelationInput | SkipRuleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for SkipRules.
     */
    cursor?: SkipRuleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SkipRules from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SkipRules.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of SkipRules.
     */
    distinct?: SkipRuleScalarFieldEnum | SkipRuleScalarFieldEnum[]
  }

  /**
   * SkipRule findFirstOrThrow
   */
  export type SkipRuleFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SkipRule
     */
    select?: SkipRuleSelect<ExtArgs> | null
    /**
     * Filter, which SkipRule to fetch.
     */
    where?: SkipRuleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SkipRules to fetch.
     */
    orderBy?: SkipRuleOrderByWithRelationInput | SkipRuleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for SkipRules.
     */
    cursor?: SkipRuleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SkipRules from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SkipRules.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of SkipRules.
     */
    distinct?: SkipRuleScalarFieldEnum | SkipRuleScalarFieldEnum[]
  }

  /**
   * SkipRule findMany
   */
  export type SkipRuleFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SkipRule
     */
    select?: SkipRuleSelect<ExtArgs> | null
    /**
     * Filter, which SkipRules to fetch.
     */
    where?: SkipRuleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SkipRules to fetch.
     */
    orderBy?: SkipRuleOrderByWithRelationInput | SkipRuleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing SkipRules.
     */
    cursor?: SkipRuleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SkipRules from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SkipRules.
     */
    skip?: number
    distinct?: SkipRuleScalarFieldEnum | SkipRuleScalarFieldEnum[]
  }

  /**
   * SkipRule create
   */
  export type SkipRuleCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SkipRule
     */
    select?: SkipRuleSelect<ExtArgs> | null
    /**
     * The data needed to create a SkipRule.
     */
    data: XOR<SkipRuleCreateInput, SkipRuleUncheckedCreateInput>
  }

  /**
   * SkipRule createMany
   */
  export type SkipRuleCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many SkipRules.
     */
    data: SkipRuleCreateManyInput | SkipRuleCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * SkipRule createManyAndReturn
   */
  export type SkipRuleCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SkipRule
     */
    select?: SkipRuleSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many SkipRules.
     */
    data: SkipRuleCreateManyInput | SkipRuleCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * SkipRule update
   */
  export type SkipRuleUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SkipRule
     */
    select?: SkipRuleSelect<ExtArgs> | null
    /**
     * The data needed to update a SkipRule.
     */
    data: XOR<SkipRuleUpdateInput, SkipRuleUncheckedUpdateInput>
    /**
     * Choose, which SkipRule to update.
     */
    where: SkipRuleWhereUniqueInput
  }

  /**
   * SkipRule updateMany
   */
  export type SkipRuleUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update SkipRules.
     */
    data: XOR<SkipRuleUpdateManyMutationInput, SkipRuleUncheckedUpdateManyInput>
    /**
     * Filter which SkipRules to update
     */
    where?: SkipRuleWhereInput
  }

  /**
   * SkipRule upsert
   */
  export type SkipRuleUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SkipRule
     */
    select?: SkipRuleSelect<ExtArgs> | null
    /**
     * The filter to search for the SkipRule to update in case it exists.
     */
    where: SkipRuleWhereUniqueInput
    /**
     * In case the SkipRule found by the `where` argument doesn't exist, create a new SkipRule with this data.
     */
    create: XOR<SkipRuleCreateInput, SkipRuleUncheckedCreateInput>
    /**
     * In case the SkipRule was found with the provided `where` argument, update it with this data.
     */
    update: XOR<SkipRuleUpdateInput, SkipRuleUncheckedUpdateInput>
  }

  /**
   * SkipRule delete
   */
  export type SkipRuleDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SkipRule
     */
    select?: SkipRuleSelect<ExtArgs> | null
    /**
     * Filter which SkipRule to delete.
     */
    where: SkipRuleWhereUniqueInput
  }

  /**
   * SkipRule deleteMany
   */
  export type SkipRuleDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which SkipRules to delete
     */
    where?: SkipRuleWhereInput
  }

  /**
   * SkipRule without action
   */
  export type SkipRuleDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SkipRule
     */
    select?: SkipRuleSelect<ExtArgs> | null
  }


  /**
   * Model UserProfile
   */

  export type AggregateUserProfile = {
    _count: UserProfileCountAggregateOutputType | null
    _avg: UserProfileAvgAggregateOutputType | null
    _sum: UserProfileSumAggregateOutputType | null
    _min: UserProfileMinAggregateOutputType | null
    _max: UserProfileMaxAggregateOutputType | null
  }

  export type UserProfileAvgAggregateOutputType = {
    id: number | null
  }

  export type UserProfileSumAggregateOutputType = {
    id: number | null
  }

  export type UserProfileMinAggregateOutputType = {
    id: number | null
    name: string | null
    email: string | null
    baseResumeText: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type UserProfileMaxAggregateOutputType = {
    id: number | null
    name: string | null
    email: string | null
    baseResumeText: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type UserProfileCountAggregateOutputType = {
    id: number
    name: number
    email: number
    baseResumeText: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type UserProfileAvgAggregateInputType = {
    id?: true
  }

  export type UserProfileSumAggregateInputType = {
    id?: true
  }

  export type UserProfileMinAggregateInputType = {
    id?: true
    name?: true
    email?: true
    baseResumeText?: true
    createdAt?: true
    updatedAt?: true
  }

  export type UserProfileMaxAggregateInputType = {
    id?: true
    name?: true
    email?: true
    baseResumeText?: true
    createdAt?: true
    updatedAt?: true
  }

  export type UserProfileCountAggregateInputType = {
    id?: true
    name?: true
    email?: true
    baseResumeText?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type UserProfileAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which UserProfile to aggregate.
     */
    where?: UserProfileWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserProfiles to fetch.
     */
    orderBy?: UserProfileOrderByWithRelationInput | UserProfileOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: UserProfileWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserProfiles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserProfiles.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned UserProfiles
    **/
    _count?: true | UserProfileCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: UserProfileAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: UserProfileSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UserProfileMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UserProfileMaxAggregateInputType
  }

  export type GetUserProfileAggregateType<T extends UserProfileAggregateArgs> = {
        [P in keyof T & keyof AggregateUserProfile]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUserProfile[P]>
      : GetScalarType<T[P], AggregateUserProfile[P]>
  }




  export type UserProfileGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserProfileWhereInput
    orderBy?: UserProfileOrderByWithAggregationInput | UserProfileOrderByWithAggregationInput[]
    by: UserProfileScalarFieldEnum[] | UserProfileScalarFieldEnum
    having?: UserProfileScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UserProfileCountAggregateInputType | true
    _avg?: UserProfileAvgAggregateInputType
    _sum?: UserProfileSumAggregateInputType
    _min?: UserProfileMinAggregateInputType
    _max?: UserProfileMaxAggregateInputType
  }

  export type UserProfileGroupByOutputType = {
    id: number
    name: string
    email: string
    baseResumeText: string
    createdAt: Date
    updatedAt: Date
    _count: UserProfileCountAggregateOutputType | null
    _avg: UserProfileAvgAggregateOutputType | null
    _sum: UserProfileSumAggregateOutputType | null
    _min: UserProfileMinAggregateOutputType | null
    _max: UserProfileMaxAggregateOutputType | null
  }

  type GetUserProfileGroupByPayload<T extends UserProfileGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UserProfileGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UserProfileGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UserProfileGroupByOutputType[P]>
            : GetScalarType<T[P], UserProfileGroupByOutputType[P]>
        }
      >
    >


  export type UserProfileSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    email?: boolean
    baseResumeText?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["userProfile"]>

  export type UserProfileSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    email?: boolean
    baseResumeText?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["userProfile"]>

  export type UserProfileSelectScalar = {
    id?: boolean
    name?: boolean
    email?: boolean
    baseResumeText?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }


  export type $UserProfilePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "UserProfile"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: number
      name: string
      email: string
      baseResumeText: string
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["userProfile"]>
    composites: {}
  }

  type UserProfileGetPayload<S extends boolean | null | undefined | UserProfileDefaultArgs> = $Result.GetResult<Prisma.$UserProfilePayload, S>

  type UserProfileCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<UserProfileFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: UserProfileCountAggregateInputType | true
    }

  export interface UserProfileDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['UserProfile'], meta: { name: 'UserProfile' } }
    /**
     * Find zero or one UserProfile that matches the filter.
     * @param {UserProfileFindUniqueArgs} args - Arguments to find a UserProfile
     * @example
     * // Get one UserProfile
     * const userProfile = await prisma.userProfile.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UserProfileFindUniqueArgs>(args: SelectSubset<T, UserProfileFindUniqueArgs<ExtArgs>>): Prisma__UserProfileClient<$Result.GetResult<Prisma.$UserProfilePayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one UserProfile that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {UserProfileFindUniqueOrThrowArgs} args - Arguments to find a UserProfile
     * @example
     * // Get one UserProfile
     * const userProfile = await prisma.userProfile.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UserProfileFindUniqueOrThrowArgs>(args: SelectSubset<T, UserProfileFindUniqueOrThrowArgs<ExtArgs>>): Prisma__UserProfileClient<$Result.GetResult<Prisma.$UserProfilePayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first UserProfile that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserProfileFindFirstArgs} args - Arguments to find a UserProfile
     * @example
     * // Get one UserProfile
     * const userProfile = await prisma.userProfile.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UserProfileFindFirstArgs>(args?: SelectSubset<T, UserProfileFindFirstArgs<ExtArgs>>): Prisma__UserProfileClient<$Result.GetResult<Prisma.$UserProfilePayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first UserProfile that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserProfileFindFirstOrThrowArgs} args - Arguments to find a UserProfile
     * @example
     * // Get one UserProfile
     * const userProfile = await prisma.userProfile.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UserProfileFindFirstOrThrowArgs>(args?: SelectSubset<T, UserProfileFindFirstOrThrowArgs<ExtArgs>>): Prisma__UserProfileClient<$Result.GetResult<Prisma.$UserProfilePayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more UserProfiles that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserProfileFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all UserProfiles
     * const userProfiles = await prisma.userProfile.findMany()
     * 
     * // Get first 10 UserProfiles
     * const userProfiles = await prisma.userProfile.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const userProfileWithIdOnly = await prisma.userProfile.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends UserProfileFindManyArgs>(args?: SelectSubset<T, UserProfileFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserProfilePayload<ExtArgs>, T, "findMany">>

    /**
     * Create a UserProfile.
     * @param {UserProfileCreateArgs} args - Arguments to create a UserProfile.
     * @example
     * // Create one UserProfile
     * const UserProfile = await prisma.userProfile.create({
     *   data: {
     *     // ... data to create a UserProfile
     *   }
     * })
     * 
     */
    create<T extends UserProfileCreateArgs>(args: SelectSubset<T, UserProfileCreateArgs<ExtArgs>>): Prisma__UserProfileClient<$Result.GetResult<Prisma.$UserProfilePayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many UserProfiles.
     * @param {UserProfileCreateManyArgs} args - Arguments to create many UserProfiles.
     * @example
     * // Create many UserProfiles
     * const userProfile = await prisma.userProfile.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends UserProfileCreateManyArgs>(args?: SelectSubset<T, UserProfileCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many UserProfiles and returns the data saved in the database.
     * @param {UserProfileCreateManyAndReturnArgs} args - Arguments to create many UserProfiles.
     * @example
     * // Create many UserProfiles
     * const userProfile = await prisma.userProfile.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many UserProfiles and only return the `id`
     * const userProfileWithIdOnly = await prisma.userProfile.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends UserProfileCreateManyAndReturnArgs>(args?: SelectSubset<T, UserProfileCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserProfilePayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a UserProfile.
     * @param {UserProfileDeleteArgs} args - Arguments to delete one UserProfile.
     * @example
     * // Delete one UserProfile
     * const UserProfile = await prisma.userProfile.delete({
     *   where: {
     *     // ... filter to delete one UserProfile
     *   }
     * })
     * 
     */
    delete<T extends UserProfileDeleteArgs>(args: SelectSubset<T, UserProfileDeleteArgs<ExtArgs>>): Prisma__UserProfileClient<$Result.GetResult<Prisma.$UserProfilePayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one UserProfile.
     * @param {UserProfileUpdateArgs} args - Arguments to update one UserProfile.
     * @example
     * // Update one UserProfile
     * const userProfile = await prisma.userProfile.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends UserProfileUpdateArgs>(args: SelectSubset<T, UserProfileUpdateArgs<ExtArgs>>): Prisma__UserProfileClient<$Result.GetResult<Prisma.$UserProfilePayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more UserProfiles.
     * @param {UserProfileDeleteManyArgs} args - Arguments to filter UserProfiles to delete.
     * @example
     * // Delete a few UserProfiles
     * const { count } = await prisma.userProfile.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends UserProfileDeleteManyArgs>(args?: SelectSubset<T, UserProfileDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more UserProfiles.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserProfileUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many UserProfiles
     * const userProfile = await prisma.userProfile.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends UserProfileUpdateManyArgs>(args: SelectSubset<T, UserProfileUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one UserProfile.
     * @param {UserProfileUpsertArgs} args - Arguments to update or create a UserProfile.
     * @example
     * // Update or create a UserProfile
     * const userProfile = await prisma.userProfile.upsert({
     *   create: {
     *     // ... data to create a UserProfile
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the UserProfile we want to update
     *   }
     * })
     */
    upsert<T extends UserProfileUpsertArgs>(args: SelectSubset<T, UserProfileUpsertArgs<ExtArgs>>): Prisma__UserProfileClient<$Result.GetResult<Prisma.$UserProfilePayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of UserProfiles.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserProfileCountArgs} args - Arguments to filter UserProfiles to count.
     * @example
     * // Count the number of UserProfiles
     * const count = await prisma.userProfile.count({
     *   where: {
     *     // ... the filter for the UserProfiles we want to count
     *   }
     * })
    **/
    count<T extends UserProfileCountArgs>(
      args?: Subset<T, UserProfileCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UserProfileCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a UserProfile.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserProfileAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends UserProfileAggregateArgs>(args: Subset<T, UserProfileAggregateArgs>): Prisma.PrismaPromise<GetUserProfileAggregateType<T>>

    /**
     * Group by UserProfile.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserProfileGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends UserProfileGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UserProfileGroupByArgs['orderBy'] }
        : { orderBy?: UserProfileGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, UserProfileGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUserProfileGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the UserProfile model
   */
  readonly fields: UserProfileFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for UserProfile.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UserProfileClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the UserProfile model
   */ 
  interface UserProfileFieldRefs {
    readonly id: FieldRef<"UserProfile", 'Int'>
    readonly name: FieldRef<"UserProfile", 'String'>
    readonly email: FieldRef<"UserProfile", 'String'>
    readonly baseResumeText: FieldRef<"UserProfile", 'String'>
    readonly createdAt: FieldRef<"UserProfile", 'DateTime'>
    readonly updatedAt: FieldRef<"UserProfile", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * UserProfile findUnique
   */
  export type UserProfileFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserProfile
     */
    select?: UserProfileSelect<ExtArgs> | null
    /**
     * Filter, which UserProfile to fetch.
     */
    where: UserProfileWhereUniqueInput
  }

  /**
   * UserProfile findUniqueOrThrow
   */
  export type UserProfileFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserProfile
     */
    select?: UserProfileSelect<ExtArgs> | null
    /**
     * Filter, which UserProfile to fetch.
     */
    where: UserProfileWhereUniqueInput
  }

  /**
   * UserProfile findFirst
   */
  export type UserProfileFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserProfile
     */
    select?: UserProfileSelect<ExtArgs> | null
    /**
     * Filter, which UserProfile to fetch.
     */
    where?: UserProfileWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserProfiles to fetch.
     */
    orderBy?: UserProfileOrderByWithRelationInput | UserProfileOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for UserProfiles.
     */
    cursor?: UserProfileWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserProfiles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserProfiles.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of UserProfiles.
     */
    distinct?: UserProfileScalarFieldEnum | UserProfileScalarFieldEnum[]
  }

  /**
   * UserProfile findFirstOrThrow
   */
  export type UserProfileFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserProfile
     */
    select?: UserProfileSelect<ExtArgs> | null
    /**
     * Filter, which UserProfile to fetch.
     */
    where?: UserProfileWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserProfiles to fetch.
     */
    orderBy?: UserProfileOrderByWithRelationInput | UserProfileOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for UserProfiles.
     */
    cursor?: UserProfileWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserProfiles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserProfiles.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of UserProfiles.
     */
    distinct?: UserProfileScalarFieldEnum | UserProfileScalarFieldEnum[]
  }

  /**
   * UserProfile findMany
   */
  export type UserProfileFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserProfile
     */
    select?: UserProfileSelect<ExtArgs> | null
    /**
     * Filter, which UserProfiles to fetch.
     */
    where?: UserProfileWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserProfiles to fetch.
     */
    orderBy?: UserProfileOrderByWithRelationInput | UserProfileOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing UserProfiles.
     */
    cursor?: UserProfileWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserProfiles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserProfiles.
     */
    skip?: number
    distinct?: UserProfileScalarFieldEnum | UserProfileScalarFieldEnum[]
  }

  /**
   * UserProfile create
   */
  export type UserProfileCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserProfile
     */
    select?: UserProfileSelect<ExtArgs> | null
    /**
     * The data needed to create a UserProfile.
     */
    data: XOR<UserProfileCreateInput, UserProfileUncheckedCreateInput>
  }

  /**
   * UserProfile createMany
   */
  export type UserProfileCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many UserProfiles.
     */
    data: UserProfileCreateManyInput | UserProfileCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * UserProfile createManyAndReturn
   */
  export type UserProfileCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserProfile
     */
    select?: UserProfileSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many UserProfiles.
     */
    data: UserProfileCreateManyInput | UserProfileCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * UserProfile update
   */
  export type UserProfileUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserProfile
     */
    select?: UserProfileSelect<ExtArgs> | null
    /**
     * The data needed to update a UserProfile.
     */
    data: XOR<UserProfileUpdateInput, UserProfileUncheckedUpdateInput>
    /**
     * Choose, which UserProfile to update.
     */
    where: UserProfileWhereUniqueInput
  }

  /**
   * UserProfile updateMany
   */
  export type UserProfileUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update UserProfiles.
     */
    data: XOR<UserProfileUpdateManyMutationInput, UserProfileUncheckedUpdateManyInput>
    /**
     * Filter which UserProfiles to update
     */
    where?: UserProfileWhereInput
  }

  /**
   * UserProfile upsert
   */
  export type UserProfileUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserProfile
     */
    select?: UserProfileSelect<ExtArgs> | null
    /**
     * The filter to search for the UserProfile to update in case it exists.
     */
    where: UserProfileWhereUniqueInput
    /**
     * In case the UserProfile found by the `where` argument doesn't exist, create a new UserProfile with this data.
     */
    create: XOR<UserProfileCreateInput, UserProfileUncheckedCreateInput>
    /**
     * In case the UserProfile was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UserProfileUpdateInput, UserProfileUncheckedUpdateInput>
  }

  /**
   * UserProfile delete
   */
  export type UserProfileDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserProfile
     */
    select?: UserProfileSelect<ExtArgs> | null
    /**
     * Filter which UserProfile to delete.
     */
    where: UserProfileWhereUniqueInput
  }

  /**
   * UserProfile deleteMany
   */
  export type UserProfileDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which UserProfiles to delete
     */
    where?: UserProfileWhereInput
  }

  /**
   * UserProfile without action
   */
  export type UserProfileDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserProfile
     */
    select?: UserProfileSelect<ExtArgs> | null
  }


  /**
   * Model ScanLog
   */

  export type AggregateScanLog = {
    _count: ScanLogCountAggregateOutputType | null
    _avg: ScanLogAvgAggregateOutputType | null
    _sum: ScanLogSumAggregateOutputType | null
    _min: ScanLogMinAggregateOutputType | null
    _max: ScanLogMaxAggregateOutputType | null
  }

  export type ScanLogAvgAggregateOutputType = {
    id: number | null
    jobsFound: number | null
    jobsSaved: number | null
    durationMs: number | null
  }

  export type ScanLogSumAggregateOutputType = {
    id: number | null
    jobsFound: number | null
    jobsSaved: number | null
    durationMs: number | null
  }

  export type ScanLogMinAggregateOutputType = {
    id: number | null
    board: string | null
    jobsFound: number | null
    jobsSaved: number | null
    errors: string | null
    durationMs: number | null
    createdAt: Date | null
  }

  export type ScanLogMaxAggregateOutputType = {
    id: number | null
    board: string | null
    jobsFound: number | null
    jobsSaved: number | null
    errors: string | null
    durationMs: number | null
    createdAt: Date | null
  }

  export type ScanLogCountAggregateOutputType = {
    id: number
    board: number
    jobsFound: number
    jobsSaved: number
    errors: number
    durationMs: number
    createdAt: number
    _all: number
  }


  export type ScanLogAvgAggregateInputType = {
    id?: true
    jobsFound?: true
    jobsSaved?: true
    durationMs?: true
  }

  export type ScanLogSumAggregateInputType = {
    id?: true
    jobsFound?: true
    jobsSaved?: true
    durationMs?: true
  }

  export type ScanLogMinAggregateInputType = {
    id?: true
    board?: true
    jobsFound?: true
    jobsSaved?: true
    errors?: true
    durationMs?: true
    createdAt?: true
  }

  export type ScanLogMaxAggregateInputType = {
    id?: true
    board?: true
    jobsFound?: true
    jobsSaved?: true
    errors?: true
    durationMs?: true
    createdAt?: true
  }

  export type ScanLogCountAggregateInputType = {
    id?: true
    board?: true
    jobsFound?: true
    jobsSaved?: true
    errors?: true
    durationMs?: true
    createdAt?: true
    _all?: true
  }

  export type ScanLogAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ScanLog to aggregate.
     */
    where?: ScanLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ScanLogs to fetch.
     */
    orderBy?: ScanLogOrderByWithRelationInput | ScanLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ScanLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ScanLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ScanLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ScanLogs
    **/
    _count?: true | ScanLogCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: ScanLogAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: ScanLogSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ScanLogMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ScanLogMaxAggregateInputType
  }

  export type GetScanLogAggregateType<T extends ScanLogAggregateArgs> = {
        [P in keyof T & keyof AggregateScanLog]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateScanLog[P]>
      : GetScalarType<T[P], AggregateScanLog[P]>
  }




  export type ScanLogGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ScanLogWhereInput
    orderBy?: ScanLogOrderByWithAggregationInput | ScanLogOrderByWithAggregationInput[]
    by: ScanLogScalarFieldEnum[] | ScanLogScalarFieldEnum
    having?: ScanLogScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ScanLogCountAggregateInputType | true
    _avg?: ScanLogAvgAggregateInputType
    _sum?: ScanLogSumAggregateInputType
    _min?: ScanLogMinAggregateInputType
    _max?: ScanLogMaxAggregateInputType
  }

  export type ScanLogGroupByOutputType = {
    id: number
    board: string
    jobsFound: number
    jobsSaved: number
    errors: string | null
    durationMs: number | null
    createdAt: Date
    _count: ScanLogCountAggregateOutputType | null
    _avg: ScanLogAvgAggregateOutputType | null
    _sum: ScanLogSumAggregateOutputType | null
    _min: ScanLogMinAggregateOutputType | null
    _max: ScanLogMaxAggregateOutputType | null
  }

  type GetScanLogGroupByPayload<T extends ScanLogGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ScanLogGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ScanLogGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ScanLogGroupByOutputType[P]>
            : GetScalarType<T[P], ScanLogGroupByOutputType[P]>
        }
      >
    >


  export type ScanLogSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    board?: boolean
    jobsFound?: boolean
    jobsSaved?: boolean
    errors?: boolean
    durationMs?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["scanLog"]>

  export type ScanLogSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    board?: boolean
    jobsFound?: boolean
    jobsSaved?: boolean
    errors?: boolean
    durationMs?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["scanLog"]>

  export type ScanLogSelectScalar = {
    id?: boolean
    board?: boolean
    jobsFound?: boolean
    jobsSaved?: boolean
    errors?: boolean
    durationMs?: boolean
    createdAt?: boolean
  }


  export type $ScanLogPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ScanLog"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: number
      board: string
      jobsFound: number
      jobsSaved: number
      errors: string | null
      durationMs: number | null
      createdAt: Date
    }, ExtArgs["result"]["scanLog"]>
    composites: {}
  }

  type ScanLogGetPayload<S extends boolean | null | undefined | ScanLogDefaultArgs> = $Result.GetResult<Prisma.$ScanLogPayload, S>

  type ScanLogCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<ScanLogFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: ScanLogCountAggregateInputType | true
    }

  export interface ScanLogDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ScanLog'], meta: { name: 'ScanLog' } }
    /**
     * Find zero or one ScanLog that matches the filter.
     * @param {ScanLogFindUniqueArgs} args - Arguments to find a ScanLog
     * @example
     * // Get one ScanLog
     * const scanLog = await prisma.scanLog.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ScanLogFindUniqueArgs>(args: SelectSubset<T, ScanLogFindUniqueArgs<ExtArgs>>): Prisma__ScanLogClient<$Result.GetResult<Prisma.$ScanLogPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one ScanLog that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {ScanLogFindUniqueOrThrowArgs} args - Arguments to find a ScanLog
     * @example
     * // Get one ScanLog
     * const scanLog = await prisma.scanLog.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ScanLogFindUniqueOrThrowArgs>(args: SelectSubset<T, ScanLogFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ScanLogClient<$Result.GetResult<Prisma.$ScanLogPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first ScanLog that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ScanLogFindFirstArgs} args - Arguments to find a ScanLog
     * @example
     * // Get one ScanLog
     * const scanLog = await prisma.scanLog.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ScanLogFindFirstArgs>(args?: SelectSubset<T, ScanLogFindFirstArgs<ExtArgs>>): Prisma__ScanLogClient<$Result.GetResult<Prisma.$ScanLogPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first ScanLog that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ScanLogFindFirstOrThrowArgs} args - Arguments to find a ScanLog
     * @example
     * // Get one ScanLog
     * const scanLog = await prisma.scanLog.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ScanLogFindFirstOrThrowArgs>(args?: SelectSubset<T, ScanLogFindFirstOrThrowArgs<ExtArgs>>): Prisma__ScanLogClient<$Result.GetResult<Prisma.$ScanLogPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more ScanLogs that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ScanLogFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ScanLogs
     * const scanLogs = await prisma.scanLog.findMany()
     * 
     * // Get first 10 ScanLogs
     * const scanLogs = await prisma.scanLog.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const scanLogWithIdOnly = await prisma.scanLog.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ScanLogFindManyArgs>(args?: SelectSubset<T, ScanLogFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ScanLogPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a ScanLog.
     * @param {ScanLogCreateArgs} args - Arguments to create a ScanLog.
     * @example
     * // Create one ScanLog
     * const ScanLog = await prisma.scanLog.create({
     *   data: {
     *     // ... data to create a ScanLog
     *   }
     * })
     * 
     */
    create<T extends ScanLogCreateArgs>(args: SelectSubset<T, ScanLogCreateArgs<ExtArgs>>): Prisma__ScanLogClient<$Result.GetResult<Prisma.$ScanLogPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many ScanLogs.
     * @param {ScanLogCreateManyArgs} args - Arguments to create many ScanLogs.
     * @example
     * // Create many ScanLogs
     * const scanLog = await prisma.scanLog.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ScanLogCreateManyArgs>(args?: SelectSubset<T, ScanLogCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many ScanLogs and returns the data saved in the database.
     * @param {ScanLogCreateManyAndReturnArgs} args - Arguments to create many ScanLogs.
     * @example
     * // Create many ScanLogs
     * const scanLog = await prisma.scanLog.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many ScanLogs and only return the `id`
     * const scanLogWithIdOnly = await prisma.scanLog.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ScanLogCreateManyAndReturnArgs>(args?: SelectSubset<T, ScanLogCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ScanLogPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a ScanLog.
     * @param {ScanLogDeleteArgs} args - Arguments to delete one ScanLog.
     * @example
     * // Delete one ScanLog
     * const ScanLog = await prisma.scanLog.delete({
     *   where: {
     *     // ... filter to delete one ScanLog
     *   }
     * })
     * 
     */
    delete<T extends ScanLogDeleteArgs>(args: SelectSubset<T, ScanLogDeleteArgs<ExtArgs>>): Prisma__ScanLogClient<$Result.GetResult<Prisma.$ScanLogPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one ScanLog.
     * @param {ScanLogUpdateArgs} args - Arguments to update one ScanLog.
     * @example
     * // Update one ScanLog
     * const scanLog = await prisma.scanLog.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ScanLogUpdateArgs>(args: SelectSubset<T, ScanLogUpdateArgs<ExtArgs>>): Prisma__ScanLogClient<$Result.GetResult<Prisma.$ScanLogPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more ScanLogs.
     * @param {ScanLogDeleteManyArgs} args - Arguments to filter ScanLogs to delete.
     * @example
     * // Delete a few ScanLogs
     * const { count } = await prisma.scanLog.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ScanLogDeleteManyArgs>(args?: SelectSubset<T, ScanLogDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ScanLogs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ScanLogUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ScanLogs
     * const scanLog = await prisma.scanLog.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ScanLogUpdateManyArgs>(args: SelectSubset<T, ScanLogUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one ScanLog.
     * @param {ScanLogUpsertArgs} args - Arguments to update or create a ScanLog.
     * @example
     * // Update or create a ScanLog
     * const scanLog = await prisma.scanLog.upsert({
     *   create: {
     *     // ... data to create a ScanLog
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ScanLog we want to update
     *   }
     * })
     */
    upsert<T extends ScanLogUpsertArgs>(args: SelectSubset<T, ScanLogUpsertArgs<ExtArgs>>): Prisma__ScanLogClient<$Result.GetResult<Prisma.$ScanLogPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of ScanLogs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ScanLogCountArgs} args - Arguments to filter ScanLogs to count.
     * @example
     * // Count the number of ScanLogs
     * const count = await prisma.scanLog.count({
     *   where: {
     *     // ... the filter for the ScanLogs we want to count
     *   }
     * })
    **/
    count<T extends ScanLogCountArgs>(
      args?: Subset<T, ScanLogCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ScanLogCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a ScanLog.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ScanLogAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ScanLogAggregateArgs>(args: Subset<T, ScanLogAggregateArgs>): Prisma.PrismaPromise<GetScanLogAggregateType<T>>

    /**
     * Group by ScanLog.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ScanLogGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ScanLogGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ScanLogGroupByArgs['orderBy'] }
        : { orderBy?: ScanLogGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ScanLogGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetScanLogGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ScanLog model
   */
  readonly fields: ScanLogFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ScanLog.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ScanLogClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the ScanLog model
   */ 
  interface ScanLogFieldRefs {
    readonly id: FieldRef<"ScanLog", 'Int'>
    readonly board: FieldRef<"ScanLog", 'String'>
    readonly jobsFound: FieldRef<"ScanLog", 'Int'>
    readonly jobsSaved: FieldRef<"ScanLog", 'Int'>
    readonly errors: FieldRef<"ScanLog", 'String'>
    readonly durationMs: FieldRef<"ScanLog", 'Int'>
    readonly createdAt: FieldRef<"ScanLog", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * ScanLog findUnique
   */
  export type ScanLogFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ScanLog
     */
    select?: ScanLogSelect<ExtArgs> | null
    /**
     * Filter, which ScanLog to fetch.
     */
    where: ScanLogWhereUniqueInput
  }

  /**
   * ScanLog findUniqueOrThrow
   */
  export type ScanLogFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ScanLog
     */
    select?: ScanLogSelect<ExtArgs> | null
    /**
     * Filter, which ScanLog to fetch.
     */
    where: ScanLogWhereUniqueInput
  }

  /**
   * ScanLog findFirst
   */
  export type ScanLogFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ScanLog
     */
    select?: ScanLogSelect<ExtArgs> | null
    /**
     * Filter, which ScanLog to fetch.
     */
    where?: ScanLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ScanLogs to fetch.
     */
    orderBy?: ScanLogOrderByWithRelationInput | ScanLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ScanLogs.
     */
    cursor?: ScanLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ScanLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ScanLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ScanLogs.
     */
    distinct?: ScanLogScalarFieldEnum | ScanLogScalarFieldEnum[]
  }

  /**
   * ScanLog findFirstOrThrow
   */
  export type ScanLogFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ScanLog
     */
    select?: ScanLogSelect<ExtArgs> | null
    /**
     * Filter, which ScanLog to fetch.
     */
    where?: ScanLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ScanLogs to fetch.
     */
    orderBy?: ScanLogOrderByWithRelationInput | ScanLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ScanLogs.
     */
    cursor?: ScanLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ScanLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ScanLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ScanLogs.
     */
    distinct?: ScanLogScalarFieldEnum | ScanLogScalarFieldEnum[]
  }

  /**
   * ScanLog findMany
   */
  export type ScanLogFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ScanLog
     */
    select?: ScanLogSelect<ExtArgs> | null
    /**
     * Filter, which ScanLogs to fetch.
     */
    where?: ScanLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ScanLogs to fetch.
     */
    orderBy?: ScanLogOrderByWithRelationInput | ScanLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ScanLogs.
     */
    cursor?: ScanLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ScanLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ScanLogs.
     */
    skip?: number
    distinct?: ScanLogScalarFieldEnum | ScanLogScalarFieldEnum[]
  }

  /**
   * ScanLog create
   */
  export type ScanLogCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ScanLog
     */
    select?: ScanLogSelect<ExtArgs> | null
    /**
     * The data needed to create a ScanLog.
     */
    data: XOR<ScanLogCreateInput, ScanLogUncheckedCreateInput>
  }

  /**
   * ScanLog createMany
   */
  export type ScanLogCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ScanLogs.
     */
    data: ScanLogCreateManyInput | ScanLogCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ScanLog createManyAndReturn
   */
  export type ScanLogCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ScanLog
     */
    select?: ScanLogSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many ScanLogs.
     */
    data: ScanLogCreateManyInput | ScanLogCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ScanLog update
   */
  export type ScanLogUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ScanLog
     */
    select?: ScanLogSelect<ExtArgs> | null
    /**
     * The data needed to update a ScanLog.
     */
    data: XOR<ScanLogUpdateInput, ScanLogUncheckedUpdateInput>
    /**
     * Choose, which ScanLog to update.
     */
    where: ScanLogWhereUniqueInput
  }

  /**
   * ScanLog updateMany
   */
  export type ScanLogUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ScanLogs.
     */
    data: XOR<ScanLogUpdateManyMutationInput, ScanLogUncheckedUpdateManyInput>
    /**
     * Filter which ScanLogs to update
     */
    where?: ScanLogWhereInput
  }

  /**
   * ScanLog upsert
   */
  export type ScanLogUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ScanLog
     */
    select?: ScanLogSelect<ExtArgs> | null
    /**
     * The filter to search for the ScanLog to update in case it exists.
     */
    where: ScanLogWhereUniqueInput
    /**
     * In case the ScanLog found by the `where` argument doesn't exist, create a new ScanLog with this data.
     */
    create: XOR<ScanLogCreateInput, ScanLogUncheckedCreateInput>
    /**
     * In case the ScanLog was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ScanLogUpdateInput, ScanLogUncheckedUpdateInput>
  }

  /**
   * ScanLog delete
   */
  export type ScanLogDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ScanLog
     */
    select?: ScanLogSelect<ExtArgs> | null
    /**
     * Filter which ScanLog to delete.
     */
    where: ScanLogWhereUniqueInput
  }

  /**
   * ScanLog deleteMany
   */
  export type ScanLogDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ScanLogs to delete
     */
    where?: ScanLogWhereInput
  }

  /**
   * ScanLog without action
   */
  export type ScanLogDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ScanLog
     */
    select?: ScanLogSelect<ExtArgs> | null
  }


  /**
   * Model GenerationLog
   */

  export type AggregateGenerationLog = {
    _count: GenerationLogCountAggregateOutputType | null
    _avg: GenerationLogAvgAggregateOutputType | null
    _sum: GenerationLogSumAggregateOutputType | null
    _min: GenerationLogMinAggregateOutputType | null
    _max: GenerationLogMaxAggregateOutputType | null
  }

  export type GenerationLogAvgAggregateOutputType = {
    id: number | null
    jobApplicationId: number | null
    tokensUsed: number | null
    durationMs: number | null
  }

  export type GenerationLogSumAggregateOutputType = {
    id: number | null
    jobApplicationId: number | null
    tokensUsed: number | null
    durationMs: number | null
  }

  export type GenerationLogMinAggregateOutputType = {
    id: number | null
    jobApplicationId: number | null
    model: string | null
    promptVersion: string | null
    success: boolean | null
    error: string | null
    tokensUsed: number | null
    durationMs: number | null
    createdAt: Date | null
  }

  export type GenerationLogMaxAggregateOutputType = {
    id: number | null
    jobApplicationId: number | null
    model: string | null
    promptVersion: string | null
    success: boolean | null
    error: string | null
    tokensUsed: number | null
    durationMs: number | null
    createdAt: Date | null
  }

  export type GenerationLogCountAggregateOutputType = {
    id: number
    jobApplicationId: number
    model: number
    promptVersion: number
    success: number
    error: number
    tokensUsed: number
    durationMs: number
    createdAt: number
    _all: number
  }


  export type GenerationLogAvgAggregateInputType = {
    id?: true
    jobApplicationId?: true
    tokensUsed?: true
    durationMs?: true
  }

  export type GenerationLogSumAggregateInputType = {
    id?: true
    jobApplicationId?: true
    tokensUsed?: true
    durationMs?: true
  }

  export type GenerationLogMinAggregateInputType = {
    id?: true
    jobApplicationId?: true
    model?: true
    promptVersion?: true
    success?: true
    error?: true
    tokensUsed?: true
    durationMs?: true
    createdAt?: true
  }

  export type GenerationLogMaxAggregateInputType = {
    id?: true
    jobApplicationId?: true
    model?: true
    promptVersion?: true
    success?: true
    error?: true
    tokensUsed?: true
    durationMs?: true
    createdAt?: true
  }

  export type GenerationLogCountAggregateInputType = {
    id?: true
    jobApplicationId?: true
    model?: true
    promptVersion?: true
    success?: true
    error?: true
    tokensUsed?: true
    durationMs?: true
    createdAt?: true
    _all?: true
  }

  export type GenerationLogAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which GenerationLog to aggregate.
     */
    where?: GenerationLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of GenerationLogs to fetch.
     */
    orderBy?: GenerationLogOrderByWithRelationInput | GenerationLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: GenerationLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` GenerationLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` GenerationLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned GenerationLogs
    **/
    _count?: true | GenerationLogCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: GenerationLogAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: GenerationLogSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: GenerationLogMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: GenerationLogMaxAggregateInputType
  }

  export type GetGenerationLogAggregateType<T extends GenerationLogAggregateArgs> = {
        [P in keyof T & keyof AggregateGenerationLog]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateGenerationLog[P]>
      : GetScalarType<T[P], AggregateGenerationLog[P]>
  }




  export type GenerationLogGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: GenerationLogWhereInput
    orderBy?: GenerationLogOrderByWithAggregationInput | GenerationLogOrderByWithAggregationInput[]
    by: GenerationLogScalarFieldEnum[] | GenerationLogScalarFieldEnum
    having?: GenerationLogScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: GenerationLogCountAggregateInputType | true
    _avg?: GenerationLogAvgAggregateInputType
    _sum?: GenerationLogSumAggregateInputType
    _min?: GenerationLogMinAggregateInputType
    _max?: GenerationLogMaxAggregateInputType
  }

  export type GenerationLogGroupByOutputType = {
    id: number
    jobApplicationId: number
    model: string
    promptVersion: string
    success: boolean
    error: string | null
    tokensUsed: number | null
    durationMs: number | null
    createdAt: Date
    _count: GenerationLogCountAggregateOutputType | null
    _avg: GenerationLogAvgAggregateOutputType | null
    _sum: GenerationLogSumAggregateOutputType | null
    _min: GenerationLogMinAggregateOutputType | null
    _max: GenerationLogMaxAggregateOutputType | null
  }

  type GetGenerationLogGroupByPayload<T extends GenerationLogGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<GenerationLogGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof GenerationLogGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], GenerationLogGroupByOutputType[P]>
            : GetScalarType<T[P], GenerationLogGroupByOutputType[P]>
        }
      >
    >


  export type GenerationLogSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    jobApplicationId?: boolean
    model?: boolean
    promptVersion?: boolean
    success?: boolean
    error?: boolean
    tokensUsed?: boolean
    durationMs?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["generationLog"]>

  export type GenerationLogSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    jobApplicationId?: boolean
    model?: boolean
    promptVersion?: boolean
    success?: boolean
    error?: boolean
    tokensUsed?: boolean
    durationMs?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["generationLog"]>

  export type GenerationLogSelectScalar = {
    id?: boolean
    jobApplicationId?: boolean
    model?: boolean
    promptVersion?: boolean
    success?: boolean
    error?: boolean
    tokensUsed?: boolean
    durationMs?: boolean
    createdAt?: boolean
  }


  export type $GenerationLogPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "GenerationLog"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: number
      jobApplicationId: number
      model: string
      promptVersion: string
      success: boolean
      error: string | null
      tokensUsed: number | null
      durationMs: number | null
      createdAt: Date
    }, ExtArgs["result"]["generationLog"]>
    composites: {}
  }

  type GenerationLogGetPayload<S extends boolean | null | undefined | GenerationLogDefaultArgs> = $Result.GetResult<Prisma.$GenerationLogPayload, S>

  type GenerationLogCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<GenerationLogFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: GenerationLogCountAggregateInputType | true
    }

  export interface GenerationLogDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['GenerationLog'], meta: { name: 'GenerationLog' } }
    /**
     * Find zero or one GenerationLog that matches the filter.
     * @param {GenerationLogFindUniqueArgs} args - Arguments to find a GenerationLog
     * @example
     * // Get one GenerationLog
     * const generationLog = await prisma.generationLog.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends GenerationLogFindUniqueArgs>(args: SelectSubset<T, GenerationLogFindUniqueArgs<ExtArgs>>): Prisma__GenerationLogClient<$Result.GetResult<Prisma.$GenerationLogPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one GenerationLog that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {GenerationLogFindUniqueOrThrowArgs} args - Arguments to find a GenerationLog
     * @example
     * // Get one GenerationLog
     * const generationLog = await prisma.generationLog.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends GenerationLogFindUniqueOrThrowArgs>(args: SelectSubset<T, GenerationLogFindUniqueOrThrowArgs<ExtArgs>>): Prisma__GenerationLogClient<$Result.GetResult<Prisma.$GenerationLogPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first GenerationLog that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GenerationLogFindFirstArgs} args - Arguments to find a GenerationLog
     * @example
     * // Get one GenerationLog
     * const generationLog = await prisma.generationLog.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends GenerationLogFindFirstArgs>(args?: SelectSubset<T, GenerationLogFindFirstArgs<ExtArgs>>): Prisma__GenerationLogClient<$Result.GetResult<Prisma.$GenerationLogPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first GenerationLog that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GenerationLogFindFirstOrThrowArgs} args - Arguments to find a GenerationLog
     * @example
     * // Get one GenerationLog
     * const generationLog = await prisma.generationLog.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends GenerationLogFindFirstOrThrowArgs>(args?: SelectSubset<T, GenerationLogFindFirstOrThrowArgs<ExtArgs>>): Prisma__GenerationLogClient<$Result.GetResult<Prisma.$GenerationLogPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more GenerationLogs that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GenerationLogFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all GenerationLogs
     * const generationLogs = await prisma.generationLog.findMany()
     * 
     * // Get first 10 GenerationLogs
     * const generationLogs = await prisma.generationLog.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const generationLogWithIdOnly = await prisma.generationLog.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends GenerationLogFindManyArgs>(args?: SelectSubset<T, GenerationLogFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$GenerationLogPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a GenerationLog.
     * @param {GenerationLogCreateArgs} args - Arguments to create a GenerationLog.
     * @example
     * // Create one GenerationLog
     * const GenerationLog = await prisma.generationLog.create({
     *   data: {
     *     // ... data to create a GenerationLog
     *   }
     * })
     * 
     */
    create<T extends GenerationLogCreateArgs>(args: SelectSubset<T, GenerationLogCreateArgs<ExtArgs>>): Prisma__GenerationLogClient<$Result.GetResult<Prisma.$GenerationLogPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many GenerationLogs.
     * @param {GenerationLogCreateManyArgs} args - Arguments to create many GenerationLogs.
     * @example
     * // Create many GenerationLogs
     * const generationLog = await prisma.generationLog.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends GenerationLogCreateManyArgs>(args?: SelectSubset<T, GenerationLogCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many GenerationLogs and returns the data saved in the database.
     * @param {GenerationLogCreateManyAndReturnArgs} args - Arguments to create many GenerationLogs.
     * @example
     * // Create many GenerationLogs
     * const generationLog = await prisma.generationLog.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many GenerationLogs and only return the `id`
     * const generationLogWithIdOnly = await prisma.generationLog.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends GenerationLogCreateManyAndReturnArgs>(args?: SelectSubset<T, GenerationLogCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$GenerationLogPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a GenerationLog.
     * @param {GenerationLogDeleteArgs} args - Arguments to delete one GenerationLog.
     * @example
     * // Delete one GenerationLog
     * const GenerationLog = await prisma.generationLog.delete({
     *   where: {
     *     // ... filter to delete one GenerationLog
     *   }
     * })
     * 
     */
    delete<T extends GenerationLogDeleteArgs>(args: SelectSubset<T, GenerationLogDeleteArgs<ExtArgs>>): Prisma__GenerationLogClient<$Result.GetResult<Prisma.$GenerationLogPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one GenerationLog.
     * @param {GenerationLogUpdateArgs} args - Arguments to update one GenerationLog.
     * @example
     * // Update one GenerationLog
     * const generationLog = await prisma.generationLog.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends GenerationLogUpdateArgs>(args: SelectSubset<T, GenerationLogUpdateArgs<ExtArgs>>): Prisma__GenerationLogClient<$Result.GetResult<Prisma.$GenerationLogPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more GenerationLogs.
     * @param {GenerationLogDeleteManyArgs} args - Arguments to filter GenerationLogs to delete.
     * @example
     * // Delete a few GenerationLogs
     * const { count } = await prisma.generationLog.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends GenerationLogDeleteManyArgs>(args?: SelectSubset<T, GenerationLogDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more GenerationLogs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GenerationLogUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many GenerationLogs
     * const generationLog = await prisma.generationLog.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends GenerationLogUpdateManyArgs>(args: SelectSubset<T, GenerationLogUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one GenerationLog.
     * @param {GenerationLogUpsertArgs} args - Arguments to update or create a GenerationLog.
     * @example
     * // Update or create a GenerationLog
     * const generationLog = await prisma.generationLog.upsert({
     *   create: {
     *     // ... data to create a GenerationLog
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the GenerationLog we want to update
     *   }
     * })
     */
    upsert<T extends GenerationLogUpsertArgs>(args: SelectSubset<T, GenerationLogUpsertArgs<ExtArgs>>): Prisma__GenerationLogClient<$Result.GetResult<Prisma.$GenerationLogPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of GenerationLogs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GenerationLogCountArgs} args - Arguments to filter GenerationLogs to count.
     * @example
     * // Count the number of GenerationLogs
     * const count = await prisma.generationLog.count({
     *   where: {
     *     // ... the filter for the GenerationLogs we want to count
     *   }
     * })
    **/
    count<T extends GenerationLogCountArgs>(
      args?: Subset<T, GenerationLogCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], GenerationLogCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a GenerationLog.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GenerationLogAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends GenerationLogAggregateArgs>(args: Subset<T, GenerationLogAggregateArgs>): Prisma.PrismaPromise<GetGenerationLogAggregateType<T>>

    /**
     * Group by GenerationLog.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GenerationLogGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends GenerationLogGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: GenerationLogGroupByArgs['orderBy'] }
        : { orderBy?: GenerationLogGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, GenerationLogGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetGenerationLogGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the GenerationLog model
   */
  readonly fields: GenerationLogFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for GenerationLog.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__GenerationLogClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the GenerationLog model
   */ 
  interface GenerationLogFieldRefs {
    readonly id: FieldRef<"GenerationLog", 'Int'>
    readonly jobApplicationId: FieldRef<"GenerationLog", 'Int'>
    readonly model: FieldRef<"GenerationLog", 'String'>
    readonly promptVersion: FieldRef<"GenerationLog", 'String'>
    readonly success: FieldRef<"GenerationLog", 'Boolean'>
    readonly error: FieldRef<"GenerationLog", 'String'>
    readonly tokensUsed: FieldRef<"GenerationLog", 'Int'>
    readonly durationMs: FieldRef<"GenerationLog", 'Int'>
    readonly createdAt: FieldRef<"GenerationLog", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * GenerationLog findUnique
   */
  export type GenerationLogFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GenerationLog
     */
    select?: GenerationLogSelect<ExtArgs> | null
    /**
     * Filter, which GenerationLog to fetch.
     */
    where: GenerationLogWhereUniqueInput
  }

  /**
   * GenerationLog findUniqueOrThrow
   */
  export type GenerationLogFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GenerationLog
     */
    select?: GenerationLogSelect<ExtArgs> | null
    /**
     * Filter, which GenerationLog to fetch.
     */
    where: GenerationLogWhereUniqueInput
  }

  /**
   * GenerationLog findFirst
   */
  export type GenerationLogFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GenerationLog
     */
    select?: GenerationLogSelect<ExtArgs> | null
    /**
     * Filter, which GenerationLog to fetch.
     */
    where?: GenerationLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of GenerationLogs to fetch.
     */
    orderBy?: GenerationLogOrderByWithRelationInput | GenerationLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for GenerationLogs.
     */
    cursor?: GenerationLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` GenerationLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` GenerationLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of GenerationLogs.
     */
    distinct?: GenerationLogScalarFieldEnum | GenerationLogScalarFieldEnum[]
  }

  /**
   * GenerationLog findFirstOrThrow
   */
  export type GenerationLogFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GenerationLog
     */
    select?: GenerationLogSelect<ExtArgs> | null
    /**
     * Filter, which GenerationLog to fetch.
     */
    where?: GenerationLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of GenerationLogs to fetch.
     */
    orderBy?: GenerationLogOrderByWithRelationInput | GenerationLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for GenerationLogs.
     */
    cursor?: GenerationLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` GenerationLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` GenerationLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of GenerationLogs.
     */
    distinct?: GenerationLogScalarFieldEnum | GenerationLogScalarFieldEnum[]
  }

  /**
   * GenerationLog findMany
   */
  export type GenerationLogFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GenerationLog
     */
    select?: GenerationLogSelect<ExtArgs> | null
    /**
     * Filter, which GenerationLogs to fetch.
     */
    where?: GenerationLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of GenerationLogs to fetch.
     */
    orderBy?: GenerationLogOrderByWithRelationInput | GenerationLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing GenerationLogs.
     */
    cursor?: GenerationLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` GenerationLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` GenerationLogs.
     */
    skip?: number
    distinct?: GenerationLogScalarFieldEnum | GenerationLogScalarFieldEnum[]
  }

  /**
   * GenerationLog create
   */
  export type GenerationLogCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GenerationLog
     */
    select?: GenerationLogSelect<ExtArgs> | null
    /**
     * The data needed to create a GenerationLog.
     */
    data: XOR<GenerationLogCreateInput, GenerationLogUncheckedCreateInput>
  }

  /**
   * GenerationLog createMany
   */
  export type GenerationLogCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many GenerationLogs.
     */
    data: GenerationLogCreateManyInput | GenerationLogCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * GenerationLog createManyAndReturn
   */
  export type GenerationLogCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GenerationLog
     */
    select?: GenerationLogSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many GenerationLogs.
     */
    data: GenerationLogCreateManyInput | GenerationLogCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * GenerationLog update
   */
  export type GenerationLogUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GenerationLog
     */
    select?: GenerationLogSelect<ExtArgs> | null
    /**
     * The data needed to update a GenerationLog.
     */
    data: XOR<GenerationLogUpdateInput, GenerationLogUncheckedUpdateInput>
    /**
     * Choose, which GenerationLog to update.
     */
    where: GenerationLogWhereUniqueInput
  }

  /**
   * GenerationLog updateMany
   */
  export type GenerationLogUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update GenerationLogs.
     */
    data: XOR<GenerationLogUpdateManyMutationInput, GenerationLogUncheckedUpdateManyInput>
    /**
     * Filter which GenerationLogs to update
     */
    where?: GenerationLogWhereInput
  }

  /**
   * GenerationLog upsert
   */
  export type GenerationLogUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GenerationLog
     */
    select?: GenerationLogSelect<ExtArgs> | null
    /**
     * The filter to search for the GenerationLog to update in case it exists.
     */
    where: GenerationLogWhereUniqueInput
    /**
     * In case the GenerationLog found by the `where` argument doesn't exist, create a new GenerationLog with this data.
     */
    create: XOR<GenerationLogCreateInput, GenerationLogUncheckedCreateInput>
    /**
     * In case the GenerationLog was found with the provided `where` argument, update it with this data.
     */
    update: XOR<GenerationLogUpdateInput, GenerationLogUncheckedUpdateInput>
  }

  /**
   * GenerationLog delete
   */
  export type GenerationLogDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GenerationLog
     */
    select?: GenerationLogSelect<ExtArgs> | null
    /**
     * Filter which GenerationLog to delete.
     */
    where: GenerationLogWhereUniqueInput
  }

  /**
   * GenerationLog deleteMany
   */
  export type GenerationLogDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which GenerationLogs to delete
     */
    where?: GenerationLogWhereInput
  }

  /**
   * GenerationLog without action
   */
  export type GenerationLogDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GenerationLog
     */
    select?: GenerationLogSelect<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const UserScalarFieldEnum: {
    id: 'id',
    email: 'email',
    passwordHash: 'passwordHash',
    createdAt: 'createdAt'
  };

  export type UserScalarFieldEnum = (typeof UserScalarFieldEnum)[keyof typeof UserScalarFieldEnum]


  export const OneClickJobScalarFieldEnum: {
    id: 'id',
    userId: 'userId',
    source: 'source',
    title: 'title',
    company: 'company',
    externalUrl: 'externalUrl',
    fullText: 'fullText',
    appliedAt: 'appliedAt',
    createdAt: 'createdAt'
  };

  export type OneClickJobScalarFieldEnum = (typeof OneClickJobScalarFieldEnum)[keyof typeof OneClickJobScalarFieldEnum]


  export const ResumeScalarFieldEnum: {
    id: 'id',
    userId: 'userId',
    name: 'name',
    rawText: 'rawText',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type ResumeScalarFieldEnum = (typeof ResumeScalarFieldEnum)[keyof typeof ResumeScalarFieldEnum]


  export const JobApplicationScalarFieldEnum: {
    id: 'id',
    userId: 'userId',
    source: 'source',
    jobrightJobId: 'jobrightJobId',
    title: 'title',
    company: 'company',
    location: 'location',
    jobType: 'jobType',
    jobrightMatchScore: 'jobrightMatchScore',
    jobrightBoard: 'jobrightBoard',
    jobrightUrl: 'jobrightUrl',
    externalUrl: 'externalUrl',
    status: 'status',
    invitedToInterview: 'invitedToInterview',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    appliedAt: 'appliedAt'
  };

  export type JobApplicationScalarFieldEnum = (typeof JobApplicationScalarFieldEnum)[keyof typeof JobApplicationScalarFieldEnum]


  export const JobDescriptionScalarFieldEnum: {
    id: 'id',
    jobApplicationId: 'jobApplicationId',
    fullText: 'fullText',
    source: 'source',
    createdAt: 'createdAt'
  };

  export type JobDescriptionScalarFieldEnum = (typeof JobDescriptionScalarFieldEnum)[keyof typeof JobDescriptionScalarFieldEnum]


  export const TailoredResumeScalarFieldEnum: {
    id: 'id',
    jobApplicationId: 'jobApplicationId',
    baseResumeId: 'baseResumeId',
    llmModel: 'llmModel',
    promptVersion: 'promptVersion',
    outputText: 'outputText',
    createdAt: 'createdAt'
  };

  export type TailoredResumeScalarFieldEnum = (typeof TailoredResumeScalarFieldEnum)[keyof typeof TailoredResumeScalarFieldEnum]


  export const CoverLetterScalarFieldEnum: {
    id: 'id',
    jobApplicationId: 'jobApplicationId',
    baseResumeId: 'baseResumeId',
    llmModel: 'llmModel',
    promptVersion: 'promptVersion',
    outputText: 'outputText',
    createdAt: 'createdAt'
  };

  export type CoverLetterScalarFieldEnum = (typeof CoverLetterScalarFieldEnum)[keyof typeof CoverLetterScalarFieldEnum]


  export const AppConfigScalarFieldEnum: {
    key: 'key',
    value: 'value',
    updatedAt: 'updatedAt'
  };

  export type AppConfigScalarFieldEnum = (typeof AppConfigScalarFieldEnum)[keyof typeof AppConfigScalarFieldEnum]


  export const SkipRuleScalarFieldEnum: {
    id: 'id',
    type: 'type',
    pattern: 'pattern',
    active: 'active',
    createdAt: 'createdAt'
  };

  export type SkipRuleScalarFieldEnum = (typeof SkipRuleScalarFieldEnum)[keyof typeof SkipRuleScalarFieldEnum]


  export const UserProfileScalarFieldEnum: {
    id: 'id',
    name: 'name',
    email: 'email',
    baseResumeText: 'baseResumeText',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type UserProfileScalarFieldEnum = (typeof UserProfileScalarFieldEnum)[keyof typeof UserProfileScalarFieldEnum]


  export const ScanLogScalarFieldEnum: {
    id: 'id',
    board: 'board',
    jobsFound: 'jobsFound',
    jobsSaved: 'jobsSaved',
    errors: 'errors',
    durationMs: 'durationMs',
    createdAt: 'createdAt'
  };

  export type ScanLogScalarFieldEnum = (typeof ScanLogScalarFieldEnum)[keyof typeof ScanLogScalarFieldEnum]


  export const GenerationLogScalarFieldEnum: {
    id: 'id',
    jobApplicationId: 'jobApplicationId',
    model: 'model',
    promptVersion: 'promptVersion',
    success: 'success',
    error: 'error',
    tokensUsed: 'tokensUsed',
    durationMs: 'durationMs',
    createdAt: 'createdAt'
  };

  export type GenerationLogScalarFieldEnum = (typeof GenerationLogScalarFieldEnum)[keyof typeof GenerationLogScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  /**
   * Field references 
   */


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'JobType'
   */
  export type EnumJobTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'JobType'>
    


  /**
   * Reference to a field of type 'JobType[]'
   */
  export type ListEnumJobTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'JobType[]'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    


  /**
   * Reference to a field of type 'ApplicationStatus'
   */
  export type EnumApplicationStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'ApplicationStatus'>
    


  /**
   * Reference to a field of type 'ApplicationStatus[]'
   */
  export type ListEnumApplicationStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'ApplicationStatus[]'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    


  /**
   * Reference to a field of type 'SkipRuleType'
   */
  export type EnumSkipRuleTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'SkipRuleType'>
    


  /**
   * Reference to a field of type 'SkipRuleType[]'
   */
  export type ListEnumSkipRuleTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'SkipRuleType[]'>
    
  /**
   * Deep Input Types
   */


  export type UserWhereInput = {
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    id?: IntFilter<"User"> | number
    email?: StringFilter<"User"> | string
    passwordHash?: StringFilter<"User"> | string
    createdAt?: DateTimeFilter<"User"> | Date | string
    resumes?: ResumeListRelationFilter
    jobApplications?: JobApplicationListRelationFilter
    oneClickJobs?: OneClickJobListRelationFilter
  }

  export type UserOrderByWithRelationInput = {
    id?: SortOrder
    email?: SortOrder
    passwordHash?: SortOrder
    createdAt?: SortOrder
    resumes?: ResumeOrderByRelationAggregateInput
    jobApplications?: JobApplicationOrderByRelationAggregateInput
    oneClickJobs?: OneClickJobOrderByRelationAggregateInput
  }

  export type UserWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    email?: string
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    passwordHash?: StringFilter<"User"> | string
    createdAt?: DateTimeFilter<"User"> | Date | string
    resumes?: ResumeListRelationFilter
    jobApplications?: JobApplicationListRelationFilter
    oneClickJobs?: OneClickJobListRelationFilter
  }, "id" | "email">

  export type UserOrderByWithAggregationInput = {
    id?: SortOrder
    email?: SortOrder
    passwordHash?: SortOrder
    createdAt?: SortOrder
    _count?: UserCountOrderByAggregateInput
    _avg?: UserAvgOrderByAggregateInput
    _max?: UserMaxOrderByAggregateInput
    _min?: UserMinOrderByAggregateInput
    _sum?: UserSumOrderByAggregateInput
  }

  export type UserScalarWhereWithAggregatesInput = {
    AND?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    OR?: UserScalarWhereWithAggregatesInput[]
    NOT?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"User"> | number
    email?: StringWithAggregatesFilter<"User"> | string
    passwordHash?: StringWithAggregatesFilter<"User"> | string
    createdAt?: DateTimeWithAggregatesFilter<"User"> | Date | string
  }

  export type OneClickJobWhereInput = {
    AND?: OneClickJobWhereInput | OneClickJobWhereInput[]
    OR?: OneClickJobWhereInput[]
    NOT?: OneClickJobWhereInput | OneClickJobWhereInput[]
    id?: IntFilter<"OneClickJob"> | number
    userId?: IntFilter<"OneClickJob"> | number
    source?: StringFilter<"OneClickJob"> | string
    title?: StringFilter<"OneClickJob"> | string
    company?: StringFilter<"OneClickJob"> | string
    externalUrl?: StringFilter<"OneClickJob"> | string
    fullText?: StringFilter<"OneClickJob"> | string
    appliedAt?: DateTimeNullableFilter<"OneClickJob"> | Date | string | null
    createdAt?: DateTimeFilter<"OneClickJob"> | Date | string
    user?: XOR<UserRelationFilter, UserWhereInput>
  }

  export type OneClickJobOrderByWithRelationInput = {
    id?: SortOrder
    userId?: SortOrder
    source?: SortOrder
    title?: SortOrder
    company?: SortOrder
    externalUrl?: SortOrder
    fullText?: SortOrder
    appliedAt?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    user?: UserOrderByWithRelationInput
  }

  export type OneClickJobWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    userId_externalUrl?: OneClickJobUserIdExternalUrlCompoundUniqueInput
    AND?: OneClickJobWhereInput | OneClickJobWhereInput[]
    OR?: OneClickJobWhereInput[]
    NOT?: OneClickJobWhereInput | OneClickJobWhereInput[]
    userId?: IntFilter<"OneClickJob"> | number
    source?: StringFilter<"OneClickJob"> | string
    title?: StringFilter<"OneClickJob"> | string
    company?: StringFilter<"OneClickJob"> | string
    externalUrl?: StringFilter<"OneClickJob"> | string
    fullText?: StringFilter<"OneClickJob"> | string
    appliedAt?: DateTimeNullableFilter<"OneClickJob"> | Date | string | null
    createdAt?: DateTimeFilter<"OneClickJob"> | Date | string
    user?: XOR<UserRelationFilter, UserWhereInput>
  }, "id" | "userId_externalUrl">

  export type OneClickJobOrderByWithAggregationInput = {
    id?: SortOrder
    userId?: SortOrder
    source?: SortOrder
    title?: SortOrder
    company?: SortOrder
    externalUrl?: SortOrder
    fullText?: SortOrder
    appliedAt?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    _count?: OneClickJobCountOrderByAggregateInput
    _avg?: OneClickJobAvgOrderByAggregateInput
    _max?: OneClickJobMaxOrderByAggregateInput
    _min?: OneClickJobMinOrderByAggregateInput
    _sum?: OneClickJobSumOrderByAggregateInput
  }

  export type OneClickJobScalarWhereWithAggregatesInput = {
    AND?: OneClickJobScalarWhereWithAggregatesInput | OneClickJobScalarWhereWithAggregatesInput[]
    OR?: OneClickJobScalarWhereWithAggregatesInput[]
    NOT?: OneClickJobScalarWhereWithAggregatesInput | OneClickJobScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"OneClickJob"> | number
    userId?: IntWithAggregatesFilter<"OneClickJob"> | number
    source?: StringWithAggregatesFilter<"OneClickJob"> | string
    title?: StringWithAggregatesFilter<"OneClickJob"> | string
    company?: StringWithAggregatesFilter<"OneClickJob"> | string
    externalUrl?: StringWithAggregatesFilter<"OneClickJob"> | string
    fullText?: StringWithAggregatesFilter<"OneClickJob"> | string
    appliedAt?: DateTimeNullableWithAggregatesFilter<"OneClickJob"> | Date | string | null
    createdAt?: DateTimeWithAggregatesFilter<"OneClickJob"> | Date | string
  }

  export type ResumeWhereInput = {
    AND?: ResumeWhereInput | ResumeWhereInput[]
    OR?: ResumeWhereInput[]
    NOT?: ResumeWhereInput | ResumeWhereInput[]
    id?: IntFilter<"Resume"> | number
    userId?: IntFilter<"Resume"> | number
    name?: StringFilter<"Resume"> | string
    rawText?: StringFilter<"Resume"> | string
    createdAt?: DateTimeFilter<"Resume"> | Date | string
    updatedAt?: DateTimeFilter<"Resume"> | Date | string
    user?: XOR<UserRelationFilter, UserWhereInput>
    tailoredResumes?: TailoredResumeListRelationFilter
    coverLetters?: CoverLetterListRelationFilter
  }

  export type ResumeOrderByWithRelationInput = {
    id?: SortOrder
    userId?: SortOrder
    name?: SortOrder
    rawText?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    user?: UserOrderByWithRelationInput
    tailoredResumes?: TailoredResumeOrderByRelationAggregateInput
    coverLetters?: CoverLetterOrderByRelationAggregateInput
  }

  export type ResumeWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    AND?: ResumeWhereInput | ResumeWhereInput[]
    OR?: ResumeWhereInput[]
    NOT?: ResumeWhereInput | ResumeWhereInput[]
    userId?: IntFilter<"Resume"> | number
    name?: StringFilter<"Resume"> | string
    rawText?: StringFilter<"Resume"> | string
    createdAt?: DateTimeFilter<"Resume"> | Date | string
    updatedAt?: DateTimeFilter<"Resume"> | Date | string
    user?: XOR<UserRelationFilter, UserWhereInput>
    tailoredResumes?: TailoredResumeListRelationFilter
    coverLetters?: CoverLetterListRelationFilter
  }, "id">

  export type ResumeOrderByWithAggregationInput = {
    id?: SortOrder
    userId?: SortOrder
    name?: SortOrder
    rawText?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: ResumeCountOrderByAggregateInput
    _avg?: ResumeAvgOrderByAggregateInput
    _max?: ResumeMaxOrderByAggregateInput
    _min?: ResumeMinOrderByAggregateInput
    _sum?: ResumeSumOrderByAggregateInput
  }

  export type ResumeScalarWhereWithAggregatesInput = {
    AND?: ResumeScalarWhereWithAggregatesInput | ResumeScalarWhereWithAggregatesInput[]
    OR?: ResumeScalarWhereWithAggregatesInput[]
    NOT?: ResumeScalarWhereWithAggregatesInput | ResumeScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"Resume"> | number
    userId?: IntWithAggregatesFilter<"Resume"> | number
    name?: StringWithAggregatesFilter<"Resume"> | string
    rawText?: StringWithAggregatesFilter<"Resume"> | string
    createdAt?: DateTimeWithAggregatesFilter<"Resume"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Resume"> | Date | string
  }

  export type JobApplicationWhereInput = {
    AND?: JobApplicationWhereInput | JobApplicationWhereInput[]
    OR?: JobApplicationWhereInput[]
    NOT?: JobApplicationWhereInput | JobApplicationWhereInput[]
    id?: IntFilter<"JobApplication"> | number
    userId?: IntFilter<"JobApplication"> | number
    source?: StringFilter<"JobApplication"> | string
    jobrightJobId?: StringNullableFilter<"JobApplication"> | string | null
    title?: StringFilter<"JobApplication"> | string
    company?: StringFilter<"JobApplication"> | string
    location?: StringNullableFilter<"JobApplication"> | string | null
    jobType?: EnumJobTypeFilter<"JobApplication"> | $Enums.JobType
    jobrightMatchScore?: FloatNullableFilter<"JobApplication"> | number | null
    jobrightBoard?: StringNullableFilter<"JobApplication"> | string | null
    jobrightUrl?: StringNullableFilter<"JobApplication"> | string | null
    externalUrl?: StringFilter<"JobApplication"> | string
    status?: EnumApplicationStatusFilter<"JobApplication"> | $Enums.ApplicationStatus
    invitedToInterview?: BoolFilter<"JobApplication"> | boolean
    createdAt?: DateTimeFilter<"JobApplication"> | Date | string
    updatedAt?: DateTimeFilter<"JobApplication"> | Date | string
    appliedAt?: DateTimeNullableFilter<"JobApplication"> | Date | string | null
    user?: XOR<UserRelationFilter, UserWhereInput>
    jobDescription?: XOR<JobDescriptionNullableRelationFilter, JobDescriptionWhereInput> | null
    tailoredResumes?: TailoredResumeListRelationFilter
    coverLetters?: CoverLetterListRelationFilter
  }

  export type JobApplicationOrderByWithRelationInput = {
    id?: SortOrder
    userId?: SortOrder
    source?: SortOrder
    jobrightJobId?: SortOrderInput | SortOrder
    title?: SortOrder
    company?: SortOrder
    location?: SortOrderInput | SortOrder
    jobType?: SortOrder
    jobrightMatchScore?: SortOrderInput | SortOrder
    jobrightBoard?: SortOrderInput | SortOrder
    jobrightUrl?: SortOrderInput | SortOrder
    externalUrl?: SortOrder
    status?: SortOrder
    invitedToInterview?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    appliedAt?: SortOrderInput | SortOrder
    user?: UserOrderByWithRelationInput
    jobDescription?: JobDescriptionOrderByWithRelationInput
    tailoredResumes?: TailoredResumeOrderByRelationAggregateInput
    coverLetters?: CoverLetterOrderByRelationAggregateInput
  }

  export type JobApplicationWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    userId_externalUrl?: JobApplicationUserIdExternalUrlCompoundUniqueInput
    userId_title_company?: JobApplicationUserIdTitleCompanyCompoundUniqueInput
    AND?: JobApplicationWhereInput | JobApplicationWhereInput[]
    OR?: JobApplicationWhereInput[]
    NOT?: JobApplicationWhereInput | JobApplicationWhereInput[]
    userId?: IntFilter<"JobApplication"> | number
    source?: StringFilter<"JobApplication"> | string
    jobrightJobId?: StringNullableFilter<"JobApplication"> | string | null
    title?: StringFilter<"JobApplication"> | string
    company?: StringFilter<"JobApplication"> | string
    location?: StringNullableFilter<"JobApplication"> | string | null
    jobType?: EnumJobTypeFilter<"JobApplication"> | $Enums.JobType
    jobrightMatchScore?: FloatNullableFilter<"JobApplication"> | number | null
    jobrightBoard?: StringNullableFilter<"JobApplication"> | string | null
    jobrightUrl?: StringNullableFilter<"JobApplication"> | string | null
    externalUrl?: StringFilter<"JobApplication"> | string
    status?: EnumApplicationStatusFilter<"JobApplication"> | $Enums.ApplicationStatus
    invitedToInterview?: BoolFilter<"JobApplication"> | boolean
    createdAt?: DateTimeFilter<"JobApplication"> | Date | string
    updatedAt?: DateTimeFilter<"JobApplication"> | Date | string
    appliedAt?: DateTimeNullableFilter<"JobApplication"> | Date | string | null
    user?: XOR<UserRelationFilter, UserWhereInput>
    jobDescription?: XOR<JobDescriptionNullableRelationFilter, JobDescriptionWhereInput> | null
    tailoredResumes?: TailoredResumeListRelationFilter
    coverLetters?: CoverLetterListRelationFilter
  }, "id" | "userId_externalUrl" | "userId_title_company">

  export type JobApplicationOrderByWithAggregationInput = {
    id?: SortOrder
    userId?: SortOrder
    source?: SortOrder
    jobrightJobId?: SortOrderInput | SortOrder
    title?: SortOrder
    company?: SortOrder
    location?: SortOrderInput | SortOrder
    jobType?: SortOrder
    jobrightMatchScore?: SortOrderInput | SortOrder
    jobrightBoard?: SortOrderInput | SortOrder
    jobrightUrl?: SortOrderInput | SortOrder
    externalUrl?: SortOrder
    status?: SortOrder
    invitedToInterview?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    appliedAt?: SortOrderInput | SortOrder
    _count?: JobApplicationCountOrderByAggregateInput
    _avg?: JobApplicationAvgOrderByAggregateInput
    _max?: JobApplicationMaxOrderByAggregateInput
    _min?: JobApplicationMinOrderByAggregateInput
    _sum?: JobApplicationSumOrderByAggregateInput
  }

  export type JobApplicationScalarWhereWithAggregatesInput = {
    AND?: JobApplicationScalarWhereWithAggregatesInput | JobApplicationScalarWhereWithAggregatesInput[]
    OR?: JobApplicationScalarWhereWithAggregatesInput[]
    NOT?: JobApplicationScalarWhereWithAggregatesInput | JobApplicationScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"JobApplication"> | number
    userId?: IntWithAggregatesFilter<"JobApplication"> | number
    source?: StringWithAggregatesFilter<"JobApplication"> | string
    jobrightJobId?: StringNullableWithAggregatesFilter<"JobApplication"> | string | null
    title?: StringWithAggregatesFilter<"JobApplication"> | string
    company?: StringWithAggregatesFilter<"JobApplication"> | string
    location?: StringNullableWithAggregatesFilter<"JobApplication"> | string | null
    jobType?: EnumJobTypeWithAggregatesFilter<"JobApplication"> | $Enums.JobType
    jobrightMatchScore?: FloatNullableWithAggregatesFilter<"JobApplication"> | number | null
    jobrightBoard?: StringNullableWithAggregatesFilter<"JobApplication"> | string | null
    jobrightUrl?: StringNullableWithAggregatesFilter<"JobApplication"> | string | null
    externalUrl?: StringWithAggregatesFilter<"JobApplication"> | string
    status?: EnumApplicationStatusWithAggregatesFilter<"JobApplication"> | $Enums.ApplicationStatus
    invitedToInterview?: BoolWithAggregatesFilter<"JobApplication"> | boolean
    createdAt?: DateTimeWithAggregatesFilter<"JobApplication"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"JobApplication"> | Date | string
    appliedAt?: DateTimeNullableWithAggregatesFilter<"JobApplication"> | Date | string | null
  }

  export type JobDescriptionWhereInput = {
    AND?: JobDescriptionWhereInput | JobDescriptionWhereInput[]
    OR?: JobDescriptionWhereInput[]
    NOT?: JobDescriptionWhereInput | JobDescriptionWhereInput[]
    id?: IntFilter<"JobDescription"> | number
    jobApplicationId?: IntFilter<"JobDescription"> | number
    fullText?: StringFilter<"JobDescription"> | string
    source?: StringFilter<"JobDescription"> | string
    createdAt?: DateTimeFilter<"JobDescription"> | Date | string
    jobApplication?: XOR<JobApplicationRelationFilter, JobApplicationWhereInput>
  }

  export type JobDescriptionOrderByWithRelationInput = {
    id?: SortOrder
    jobApplicationId?: SortOrder
    fullText?: SortOrder
    source?: SortOrder
    createdAt?: SortOrder
    jobApplication?: JobApplicationOrderByWithRelationInput
  }

  export type JobDescriptionWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    jobApplicationId?: number
    AND?: JobDescriptionWhereInput | JobDescriptionWhereInput[]
    OR?: JobDescriptionWhereInput[]
    NOT?: JobDescriptionWhereInput | JobDescriptionWhereInput[]
    fullText?: StringFilter<"JobDescription"> | string
    source?: StringFilter<"JobDescription"> | string
    createdAt?: DateTimeFilter<"JobDescription"> | Date | string
    jobApplication?: XOR<JobApplicationRelationFilter, JobApplicationWhereInput>
  }, "id" | "jobApplicationId">

  export type JobDescriptionOrderByWithAggregationInput = {
    id?: SortOrder
    jobApplicationId?: SortOrder
    fullText?: SortOrder
    source?: SortOrder
    createdAt?: SortOrder
    _count?: JobDescriptionCountOrderByAggregateInput
    _avg?: JobDescriptionAvgOrderByAggregateInput
    _max?: JobDescriptionMaxOrderByAggregateInput
    _min?: JobDescriptionMinOrderByAggregateInput
    _sum?: JobDescriptionSumOrderByAggregateInput
  }

  export type JobDescriptionScalarWhereWithAggregatesInput = {
    AND?: JobDescriptionScalarWhereWithAggregatesInput | JobDescriptionScalarWhereWithAggregatesInput[]
    OR?: JobDescriptionScalarWhereWithAggregatesInput[]
    NOT?: JobDescriptionScalarWhereWithAggregatesInput | JobDescriptionScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"JobDescription"> | number
    jobApplicationId?: IntWithAggregatesFilter<"JobDescription"> | number
    fullText?: StringWithAggregatesFilter<"JobDescription"> | string
    source?: StringWithAggregatesFilter<"JobDescription"> | string
    createdAt?: DateTimeWithAggregatesFilter<"JobDescription"> | Date | string
  }

  export type TailoredResumeWhereInput = {
    AND?: TailoredResumeWhereInput | TailoredResumeWhereInput[]
    OR?: TailoredResumeWhereInput[]
    NOT?: TailoredResumeWhereInput | TailoredResumeWhereInput[]
    id?: IntFilter<"TailoredResume"> | number
    jobApplicationId?: IntFilter<"TailoredResume"> | number
    baseResumeId?: IntFilter<"TailoredResume"> | number
    llmModel?: StringFilter<"TailoredResume"> | string
    promptVersion?: StringFilter<"TailoredResume"> | string
    outputText?: StringFilter<"TailoredResume"> | string
    createdAt?: DateTimeFilter<"TailoredResume"> | Date | string
    jobApplication?: XOR<JobApplicationRelationFilter, JobApplicationWhereInput>
    baseResume?: XOR<ResumeRelationFilter, ResumeWhereInput>
  }

  export type TailoredResumeOrderByWithRelationInput = {
    id?: SortOrder
    jobApplicationId?: SortOrder
    baseResumeId?: SortOrder
    llmModel?: SortOrder
    promptVersion?: SortOrder
    outputText?: SortOrder
    createdAt?: SortOrder
    jobApplication?: JobApplicationOrderByWithRelationInput
    baseResume?: ResumeOrderByWithRelationInput
  }

  export type TailoredResumeWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    AND?: TailoredResumeWhereInput | TailoredResumeWhereInput[]
    OR?: TailoredResumeWhereInput[]
    NOT?: TailoredResumeWhereInput | TailoredResumeWhereInput[]
    jobApplicationId?: IntFilter<"TailoredResume"> | number
    baseResumeId?: IntFilter<"TailoredResume"> | number
    llmModel?: StringFilter<"TailoredResume"> | string
    promptVersion?: StringFilter<"TailoredResume"> | string
    outputText?: StringFilter<"TailoredResume"> | string
    createdAt?: DateTimeFilter<"TailoredResume"> | Date | string
    jobApplication?: XOR<JobApplicationRelationFilter, JobApplicationWhereInput>
    baseResume?: XOR<ResumeRelationFilter, ResumeWhereInput>
  }, "id">

  export type TailoredResumeOrderByWithAggregationInput = {
    id?: SortOrder
    jobApplicationId?: SortOrder
    baseResumeId?: SortOrder
    llmModel?: SortOrder
    promptVersion?: SortOrder
    outputText?: SortOrder
    createdAt?: SortOrder
    _count?: TailoredResumeCountOrderByAggregateInput
    _avg?: TailoredResumeAvgOrderByAggregateInput
    _max?: TailoredResumeMaxOrderByAggregateInput
    _min?: TailoredResumeMinOrderByAggregateInput
    _sum?: TailoredResumeSumOrderByAggregateInput
  }

  export type TailoredResumeScalarWhereWithAggregatesInput = {
    AND?: TailoredResumeScalarWhereWithAggregatesInput | TailoredResumeScalarWhereWithAggregatesInput[]
    OR?: TailoredResumeScalarWhereWithAggregatesInput[]
    NOT?: TailoredResumeScalarWhereWithAggregatesInput | TailoredResumeScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"TailoredResume"> | number
    jobApplicationId?: IntWithAggregatesFilter<"TailoredResume"> | number
    baseResumeId?: IntWithAggregatesFilter<"TailoredResume"> | number
    llmModel?: StringWithAggregatesFilter<"TailoredResume"> | string
    promptVersion?: StringWithAggregatesFilter<"TailoredResume"> | string
    outputText?: StringWithAggregatesFilter<"TailoredResume"> | string
    createdAt?: DateTimeWithAggregatesFilter<"TailoredResume"> | Date | string
  }

  export type CoverLetterWhereInput = {
    AND?: CoverLetterWhereInput | CoverLetterWhereInput[]
    OR?: CoverLetterWhereInput[]
    NOT?: CoverLetterWhereInput | CoverLetterWhereInput[]
    id?: IntFilter<"CoverLetter"> | number
    jobApplicationId?: IntFilter<"CoverLetter"> | number
    baseResumeId?: IntNullableFilter<"CoverLetter"> | number | null
    llmModel?: StringFilter<"CoverLetter"> | string
    promptVersion?: StringFilter<"CoverLetter"> | string
    outputText?: StringFilter<"CoverLetter"> | string
    createdAt?: DateTimeFilter<"CoverLetter"> | Date | string
    jobApplication?: XOR<JobApplicationRelationFilter, JobApplicationWhereInput>
    baseResume?: XOR<ResumeNullableRelationFilter, ResumeWhereInput> | null
  }

  export type CoverLetterOrderByWithRelationInput = {
    id?: SortOrder
    jobApplicationId?: SortOrder
    baseResumeId?: SortOrderInput | SortOrder
    llmModel?: SortOrder
    promptVersion?: SortOrder
    outputText?: SortOrder
    createdAt?: SortOrder
    jobApplication?: JobApplicationOrderByWithRelationInput
    baseResume?: ResumeOrderByWithRelationInput
  }

  export type CoverLetterWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    AND?: CoverLetterWhereInput | CoverLetterWhereInput[]
    OR?: CoverLetterWhereInput[]
    NOT?: CoverLetterWhereInput | CoverLetterWhereInput[]
    jobApplicationId?: IntFilter<"CoverLetter"> | number
    baseResumeId?: IntNullableFilter<"CoverLetter"> | number | null
    llmModel?: StringFilter<"CoverLetter"> | string
    promptVersion?: StringFilter<"CoverLetter"> | string
    outputText?: StringFilter<"CoverLetter"> | string
    createdAt?: DateTimeFilter<"CoverLetter"> | Date | string
    jobApplication?: XOR<JobApplicationRelationFilter, JobApplicationWhereInput>
    baseResume?: XOR<ResumeNullableRelationFilter, ResumeWhereInput> | null
  }, "id">

  export type CoverLetterOrderByWithAggregationInput = {
    id?: SortOrder
    jobApplicationId?: SortOrder
    baseResumeId?: SortOrderInput | SortOrder
    llmModel?: SortOrder
    promptVersion?: SortOrder
    outputText?: SortOrder
    createdAt?: SortOrder
    _count?: CoverLetterCountOrderByAggregateInput
    _avg?: CoverLetterAvgOrderByAggregateInput
    _max?: CoverLetterMaxOrderByAggregateInput
    _min?: CoverLetterMinOrderByAggregateInput
    _sum?: CoverLetterSumOrderByAggregateInput
  }

  export type CoverLetterScalarWhereWithAggregatesInput = {
    AND?: CoverLetterScalarWhereWithAggregatesInput | CoverLetterScalarWhereWithAggregatesInput[]
    OR?: CoverLetterScalarWhereWithAggregatesInput[]
    NOT?: CoverLetterScalarWhereWithAggregatesInput | CoverLetterScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"CoverLetter"> | number
    jobApplicationId?: IntWithAggregatesFilter<"CoverLetter"> | number
    baseResumeId?: IntNullableWithAggregatesFilter<"CoverLetter"> | number | null
    llmModel?: StringWithAggregatesFilter<"CoverLetter"> | string
    promptVersion?: StringWithAggregatesFilter<"CoverLetter"> | string
    outputText?: StringWithAggregatesFilter<"CoverLetter"> | string
    createdAt?: DateTimeWithAggregatesFilter<"CoverLetter"> | Date | string
  }

  export type AppConfigWhereInput = {
    AND?: AppConfigWhereInput | AppConfigWhereInput[]
    OR?: AppConfigWhereInput[]
    NOT?: AppConfigWhereInput | AppConfigWhereInput[]
    key?: StringFilter<"AppConfig"> | string
    value?: StringFilter<"AppConfig"> | string
    updatedAt?: DateTimeFilter<"AppConfig"> | Date | string
  }

  export type AppConfigOrderByWithRelationInput = {
    key?: SortOrder
    value?: SortOrder
    updatedAt?: SortOrder
  }

  export type AppConfigWhereUniqueInput = Prisma.AtLeast<{
    key?: string
    AND?: AppConfigWhereInput | AppConfigWhereInput[]
    OR?: AppConfigWhereInput[]
    NOT?: AppConfigWhereInput | AppConfigWhereInput[]
    value?: StringFilter<"AppConfig"> | string
    updatedAt?: DateTimeFilter<"AppConfig"> | Date | string
  }, "key">

  export type AppConfigOrderByWithAggregationInput = {
    key?: SortOrder
    value?: SortOrder
    updatedAt?: SortOrder
    _count?: AppConfigCountOrderByAggregateInput
    _max?: AppConfigMaxOrderByAggregateInput
    _min?: AppConfigMinOrderByAggregateInput
  }

  export type AppConfigScalarWhereWithAggregatesInput = {
    AND?: AppConfigScalarWhereWithAggregatesInput | AppConfigScalarWhereWithAggregatesInput[]
    OR?: AppConfigScalarWhereWithAggregatesInput[]
    NOT?: AppConfigScalarWhereWithAggregatesInput | AppConfigScalarWhereWithAggregatesInput[]
    key?: StringWithAggregatesFilter<"AppConfig"> | string
    value?: StringWithAggregatesFilter<"AppConfig"> | string
    updatedAt?: DateTimeWithAggregatesFilter<"AppConfig"> | Date | string
  }

  export type SkipRuleWhereInput = {
    AND?: SkipRuleWhereInput | SkipRuleWhereInput[]
    OR?: SkipRuleWhereInput[]
    NOT?: SkipRuleWhereInput | SkipRuleWhereInput[]
    id?: IntFilter<"SkipRule"> | number
    type?: EnumSkipRuleTypeFilter<"SkipRule"> | $Enums.SkipRuleType
    pattern?: StringFilter<"SkipRule"> | string
    active?: BoolFilter<"SkipRule"> | boolean
    createdAt?: DateTimeFilter<"SkipRule"> | Date | string
  }

  export type SkipRuleOrderByWithRelationInput = {
    id?: SortOrder
    type?: SortOrder
    pattern?: SortOrder
    active?: SortOrder
    createdAt?: SortOrder
  }

  export type SkipRuleWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    AND?: SkipRuleWhereInput | SkipRuleWhereInput[]
    OR?: SkipRuleWhereInput[]
    NOT?: SkipRuleWhereInput | SkipRuleWhereInput[]
    type?: EnumSkipRuleTypeFilter<"SkipRule"> | $Enums.SkipRuleType
    pattern?: StringFilter<"SkipRule"> | string
    active?: BoolFilter<"SkipRule"> | boolean
    createdAt?: DateTimeFilter<"SkipRule"> | Date | string
  }, "id">

  export type SkipRuleOrderByWithAggregationInput = {
    id?: SortOrder
    type?: SortOrder
    pattern?: SortOrder
    active?: SortOrder
    createdAt?: SortOrder
    _count?: SkipRuleCountOrderByAggregateInput
    _avg?: SkipRuleAvgOrderByAggregateInput
    _max?: SkipRuleMaxOrderByAggregateInput
    _min?: SkipRuleMinOrderByAggregateInput
    _sum?: SkipRuleSumOrderByAggregateInput
  }

  export type SkipRuleScalarWhereWithAggregatesInput = {
    AND?: SkipRuleScalarWhereWithAggregatesInput | SkipRuleScalarWhereWithAggregatesInput[]
    OR?: SkipRuleScalarWhereWithAggregatesInput[]
    NOT?: SkipRuleScalarWhereWithAggregatesInput | SkipRuleScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"SkipRule"> | number
    type?: EnumSkipRuleTypeWithAggregatesFilter<"SkipRule"> | $Enums.SkipRuleType
    pattern?: StringWithAggregatesFilter<"SkipRule"> | string
    active?: BoolWithAggregatesFilter<"SkipRule"> | boolean
    createdAt?: DateTimeWithAggregatesFilter<"SkipRule"> | Date | string
  }

  export type UserProfileWhereInput = {
    AND?: UserProfileWhereInput | UserProfileWhereInput[]
    OR?: UserProfileWhereInput[]
    NOT?: UserProfileWhereInput | UserProfileWhereInput[]
    id?: IntFilter<"UserProfile"> | number
    name?: StringFilter<"UserProfile"> | string
    email?: StringFilter<"UserProfile"> | string
    baseResumeText?: StringFilter<"UserProfile"> | string
    createdAt?: DateTimeFilter<"UserProfile"> | Date | string
    updatedAt?: DateTimeFilter<"UserProfile"> | Date | string
  }

  export type UserProfileOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    email?: SortOrder
    baseResumeText?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UserProfileWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    email?: string
    AND?: UserProfileWhereInput | UserProfileWhereInput[]
    OR?: UserProfileWhereInput[]
    NOT?: UserProfileWhereInput | UserProfileWhereInput[]
    name?: StringFilter<"UserProfile"> | string
    baseResumeText?: StringFilter<"UserProfile"> | string
    createdAt?: DateTimeFilter<"UserProfile"> | Date | string
    updatedAt?: DateTimeFilter<"UserProfile"> | Date | string
  }, "id" | "email">

  export type UserProfileOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    email?: SortOrder
    baseResumeText?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: UserProfileCountOrderByAggregateInput
    _avg?: UserProfileAvgOrderByAggregateInput
    _max?: UserProfileMaxOrderByAggregateInput
    _min?: UserProfileMinOrderByAggregateInput
    _sum?: UserProfileSumOrderByAggregateInput
  }

  export type UserProfileScalarWhereWithAggregatesInput = {
    AND?: UserProfileScalarWhereWithAggregatesInput | UserProfileScalarWhereWithAggregatesInput[]
    OR?: UserProfileScalarWhereWithAggregatesInput[]
    NOT?: UserProfileScalarWhereWithAggregatesInput | UserProfileScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"UserProfile"> | number
    name?: StringWithAggregatesFilter<"UserProfile"> | string
    email?: StringWithAggregatesFilter<"UserProfile"> | string
    baseResumeText?: StringWithAggregatesFilter<"UserProfile"> | string
    createdAt?: DateTimeWithAggregatesFilter<"UserProfile"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"UserProfile"> | Date | string
  }

  export type ScanLogWhereInput = {
    AND?: ScanLogWhereInput | ScanLogWhereInput[]
    OR?: ScanLogWhereInput[]
    NOT?: ScanLogWhereInput | ScanLogWhereInput[]
    id?: IntFilter<"ScanLog"> | number
    board?: StringFilter<"ScanLog"> | string
    jobsFound?: IntFilter<"ScanLog"> | number
    jobsSaved?: IntFilter<"ScanLog"> | number
    errors?: StringNullableFilter<"ScanLog"> | string | null
    durationMs?: IntNullableFilter<"ScanLog"> | number | null
    createdAt?: DateTimeFilter<"ScanLog"> | Date | string
  }

  export type ScanLogOrderByWithRelationInput = {
    id?: SortOrder
    board?: SortOrder
    jobsFound?: SortOrder
    jobsSaved?: SortOrder
    errors?: SortOrderInput | SortOrder
    durationMs?: SortOrderInput | SortOrder
    createdAt?: SortOrder
  }

  export type ScanLogWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    AND?: ScanLogWhereInput | ScanLogWhereInput[]
    OR?: ScanLogWhereInput[]
    NOT?: ScanLogWhereInput | ScanLogWhereInput[]
    board?: StringFilter<"ScanLog"> | string
    jobsFound?: IntFilter<"ScanLog"> | number
    jobsSaved?: IntFilter<"ScanLog"> | number
    errors?: StringNullableFilter<"ScanLog"> | string | null
    durationMs?: IntNullableFilter<"ScanLog"> | number | null
    createdAt?: DateTimeFilter<"ScanLog"> | Date | string
  }, "id">

  export type ScanLogOrderByWithAggregationInput = {
    id?: SortOrder
    board?: SortOrder
    jobsFound?: SortOrder
    jobsSaved?: SortOrder
    errors?: SortOrderInput | SortOrder
    durationMs?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    _count?: ScanLogCountOrderByAggregateInput
    _avg?: ScanLogAvgOrderByAggregateInput
    _max?: ScanLogMaxOrderByAggregateInput
    _min?: ScanLogMinOrderByAggregateInput
    _sum?: ScanLogSumOrderByAggregateInput
  }

  export type ScanLogScalarWhereWithAggregatesInput = {
    AND?: ScanLogScalarWhereWithAggregatesInput | ScanLogScalarWhereWithAggregatesInput[]
    OR?: ScanLogScalarWhereWithAggregatesInput[]
    NOT?: ScanLogScalarWhereWithAggregatesInput | ScanLogScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"ScanLog"> | number
    board?: StringWithAggregatesFilter<"ScanLog"> | string
    jobsFound?: IntWithAggregatesFilter<"ScanLog"> | number
    jobsSaved?: IntWithAggregatesFilter<"ScanLog"> | number
    errors?: StringNullableWithAggregatesFilter<"ScanLog"> | string | null
    durationMs?: IntNullableWithAggregatesFilter<"ScanLog"> | number | null
    createdAt?: DateTimeWithAggregatesFilter<"ScanLog"> | Date | string
  }

  export type GenerationLogWhereInput = {
    AND?: GenerationLogWhereInput | GenerationLogWhereInput[]
    OR?: GenerationLogWhereInput[]
    NOT?: GenerationLogWhereInput | GenerationLogWhereInput[]
    id?: IntFilter<"GenerationLog"> | number
    jobApplicationId?: IntFilter<"GenerationLog"> | number
    model?: StringFilter<"GenerationLog"> | string
    promptVersion?: StringFilter<"GenerationLog"> | string
    success?: BoolFilter<"GenerationLog"> | boolean
    error?: StringNullableFilter<"GenerationLog"> | string | null
    tokensUsed?: IntNullableFilter<"GenerationLog"> | number | null
    durationMs?: IntNullableFilter<"GenerationLog"> | number | null
    createdAt?: DateTimeFilter<"GenerationLog"> | Date | string
  }

  export type GenerationLogOrderByWithRelationInput = {
    id?: SortOrder
    jobApplicationId?: SortOrder
    model?: SortOrder
    promptVersion?: SortOrder
    success?: SortOrder
    error?: SortOrderInput | SortOrder
    tokensUsed?: SortOrderInput | SortOrder
    durationMs?: SortOrderInput | SortOrder
    createdAt?: SortOrder
  }

  export type GenerationLogWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    AND?: GenerationLogWhereInput | GenerationLogWhereInput[]
    OR?: GenerationLogWhereInput[]
    NOT?: GenerationLogWhereInput | GenerationLogWhereInput[]
    jobApplicationId?: IntFilter<"GenerationLog"> | number
    model?: StringFilter<"GenerationLog"> | string
    promptVersion?: StringFilter<"GenerationLog"> | string
    success?: BoolFilter<"GenerationLog"> | boolean
    error?: StringNullableFilter<"GenerationLog"> | string | null
    tokensUsed?: IntNullableFilter<"GenerationLog"> | number | null
    durationMs?: IntNullableFilter<"GenerationLog"> | number | null
    createdAt?: DateTimeFilter<"GenerationLog"> | Date | string
  }, "id">

  export type GenerationLogOrderByWithAggregationInput = {
    id?: SortOrder
    jobApplicationId?: SortOrder
    model?: SortOrder
    promptVersion?: SortOrder
    success?: SortOrder
    error?: SortOrderInput | SortOrder
    tokensUsed?: SortOrderInput | SortOrder
    durationMs?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    _count?: GenerationLogCountOrderByAggregateInput
    _avg?: GenerationLogAvgOrderByAggregateInput
    _max?: GenerationLogMaxOrderByAggregateInput
    _min?: GenerationLogMinOrderByAggregateInput
    _sum?: GenerationLogSumOrderByAggregateInput
  }

  export type GenerationLogScalarWhereWithAggregatesInput = {
    AND?: GenerationLogScalarWhereWithAggregatesInput | GenerationLogScalarWhereWithAggregatesInput[]
    OR?: GenerationLogScalarWhereWithAggregatesInput[]
    NOT?: GenerationLogScalarWhereWithAggregatesInput | GenerationLogScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"GenerationLog"> | number
    jobApplicationId?: IntWithAggregatesFilter<"GenerationLog"> | number
    model?: StringWithAggregatesFilter<"GenerationLog"> | string
    promptVersion?: StringWithAggregatesFilter<"GenerationLog"> | string
    success?: BoolWithAggregatesFilter<"GenerationLog"> | boolean
    error?: StringNullableWithAggregatesFilter<"GenerationLog"> | string | null
    tokensUsed?: IntNullableWithAggregatesFilter<"GenerationLog"> | number | null
    durationMs?: IntNullableWithAggregatesFilter<"GenerationLog"> | number | null
    createdAt?: DateTimeWithAggregatesFilter<"GenerationLog"> | Date | string
  }

  export type UserCreateInput = {
    email: string
    passwordHash: string
    createdAt?: Date | string
    resumes?: ResumeCreateNestedManyWithoutUserInput
    jobApplications?: JobApplicationCreateNestedManyWithoutUserInput
    oneClickJobs?: OneClickJobCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateInput = {
    id?: number
    email: string
    passwordHash: string
    createdAt?: Date | string
    resumes?: ResumeUncheckedCreateNestedManyWithoutUserInput
    jobApplications?: JobApplicationUncheckedCreateNestedManyWithoutUserInput
    oneClickJobs?: OneClickJobUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserUpdateInput = {
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    resumes?: ResumeUpdateManyWithoutUserNestedInput
    jobApplications?: JobApplicationUpdateManyWithoutUserNestedInput
    oneClickJobs?: OneClickJobUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    resumes?: ResumeUncheckedUpdateManyWithoutUserNestedInput
    jobApplications?: JobApplicationUncheckedUpdateManyWithoutUserNestedInput
    oneClickJobs?: OneClickJobUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserCreateManyInput = {
    id?: number
    email: string
    passwordHash: string
    createdAt?: Date | string
  }

  export type UserUpdateManyMutationInput = {
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OneClickJobCreateInput = {
    source: string
    title: string
    company: string
    externalUrl: string
    fullText: string
    appliedAt?: Date | string | null
    createdAt?: Date | string
    user: UserCreateNestedOneWithoutOneClickJobsInput
  }

  export type OneClickJobUncheckedCreateInput = {
    id?: number
    userId: number
    source: string
    title: string
    company: string
    externalUrl: string
    fullText: string
    appliedAt?: Date | string | null
    createdAt?: Date | string
  }

  export type OneClickJobUpdateInput = {
    source?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    company?: StringFieldUpdateOperationsInput | string
    externalUrl?: StringFieldUpdateOperationsInput | string
    fullText?: StringFieldUpdateOperationsInput | string
    appliedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutOneClickJobsNestedInput
  }

  export type OneClickJobUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    userId?: IntFieldUpdateOperationsInput | number
    source?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    company?: StringFieldUpdateOperationsInput | string
    externalUrl?: StringFieldUpdateOperationsInput | string
    fullText?: StringFieldUpdateOperationsInput | string
    appliedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OneClickJobCreateManyInput = {
    id?: number
    userId: number
    source: string
    title: string
    company: string
    externalUrl: string
    fullText: string
    appliedAt?: Date | string | null
    createdAt?: Date | string
  }

  export type OneClickJobUpdateManyMutationInput = {
    source?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    company?: StringFieldUpdateOperationsInput | string
    externalUrl?: StringFieldUpdateOperationsInput | string
    fullText?: StringFieldUpdateOperationsInput | string
    appliedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OneClickJobUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    userId?: IntFieldUpdateOperationsInput | number
    source?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    company?: StringFieldUpdateOperationsInput | string
    externalUrl?: StringFieldUpdateOperationsInput | string
    fullText?: StringFieldUpdateOperationsInput | string
    appliedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ResumeCreateInput = {
    name: string
    rawText: string
    createdAt?: Date | string
    updatedAt?: Date | string
    user: UserCreateNestedOneWithoutResumesInput
    tailoredResumes?: TailoredResumeCreateNestedManyWithoutBaseResumeInput
    coverLetters?: CoverLetterCreateNestedManyWithoutBaseResumeInput
  }

  export type ResumeUncheckedCreateInput = {
    id?: number
    userId: number
    name: string
    rawText: string
    createdAt?: Date | string
    updatedAt?: Date | string
    tailoredResumes?: TailoredResumeUncheckedCreateNestedManyWithoutBaseResumeInput
    coverLetters?: CoverLetterUncheckedCreateNestedManyWithoutBaseResumeInput
  }

  export type ResumeUpdateInput = {
    name?: StringFieldUpdateOperationsInput | string
    rawText?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutResumesNestedInput
    tailoredResumes?: TailoredResumeUpdateManyWithoutBaseResumeNestedInput
    coverLetters?: CoverLetterUpdateManyWithoutBaseResumeNestedInput
  }

  export type ResumeUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    userId?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    rawText?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tailoredResumes?: TailoredResumeUncheckedUpdateManyWithoutBaseResumeNestedInput
    coverLetters?: CoverLetterUncheckedUpdateManyWithoutBaseResumeNestedInput
  }

  export type ResumeCreateManyInput = {
    id?: number
    userId: number
    name: string
    rawText: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ResumeUpdateManyMutationInput = {
    name?: StringFieldUpdateOperationsInput | string
    rawText?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ResumeUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    userId?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    rawText?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type JobApplicationCreateInput = {
    source?: string
    jobrightJobId?: string | null
    title: string
    company: string
    location?: string | null
    jobType?: $Enums.JobType
    jobrightMatchScore?: number | null
    jobrightBoard?: string | null
    jobrightUrl?: string | null
    externalUrl: string
    status?: $Enums.ApplicationStatus
    invitedToInterview?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    appliedAt?: Date | string | null
    user: UserCreateNestedOneWithoutJobApplicationsInput
    jobDescription?: JobDescriptionCreateNestedOneWithoutJobApplicationInput
    tailoredResumes?: TailoredResumeCreateNestedManyWithoutJobApplicationInput
    coverLetters?: CoverLetterCreateNestedManyWithoutJobApplicationInput
  }

  export type JobApplicationUncheckedCreateInput = {
    id?: number
    userId: number
    source?: string
    jobrightJobId?: string | null
    title: string
    company: string
    location?: string | null
    jobType?: $Enums.JobType
    jobrightMatchScore?: number | null
    jobrightBoard?: string | null
    jobrightUrl?: string | null
    externalUrl: string
    status?: $Enums.ApplicationStatus
    invitedToInterview?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    appliedAt?: Date | string | null
    jobDescription?: JobDescriptionUncheckedCreateNestedOneWithoutJobApplicationInput
    tailoredResumes?: TailoredResumeUncheckedCreateNestedManyWithoutJobApplicationInput
    coverLetters?: CoverLetterUncheckedCreateNestedManyWithoutJobApplicationInput
  }

  export type JobApplicationUpdateInput = {
    source?: StringFieldUpdateOperationsInput | string
    jobrightJobId?: NullableStringFieldUpdateOperationsInput | string | null
    title?: StringFieldUpdateOperationsInput | string
    company?: StringFieldUpdateOperationsInput | string
    location?: NullableStringFieldUpdateOperationsInput | string | null
    jobType?: EnumJobTypeFieldUpdateOperationsInput | $Enums.JobType
    jobrightMatchScore?: NullableFloatFieldUpdateOperationsInput | number | null
    jobrightBoard?: NullableStringFieldUpdateOperationsInput | string | null
    jobrightUrl?: NullableStringFieldUpdateOperationsInput | string | null
    externalUrl?: StringFieldUpdateOperationsInput | string
    status?: EnumApplicationStatusFieldUpdateOperationsInput | $Enums.ApplicationStatus
    invitedToInterview?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    appliedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    user?: UserUpdateOneRequiredWithoutJobApplicationsNestedInput
    jobDescription?: JobDescriptionUpdateOneWithoutJobApplicationNestedInput
    tailoredResumes?: TailoredResumeUpdateManyWithoutJobApplicationNestedInput
    coverLetters?: CoverLetterUpdateManyWithoutJobApplicationNestedInput
  }

  export type JobApplicationUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    userId?: IntFieldUpdateOperationsInput | number
    source?: StringFieldUpdateOperationsInput | string
    jobrightJobId?: NullableStringFieldUpdateOperationsInput | string | null
    title?: StringFieldUpdateOperationsInput | string
    company?: StringFieldUpdateOperationsInput | string
    location?: NullableStringFieldUpdateOperationsInput | string | null
    jobType?: EnumJobTypeFieldUpdateOperationsInput | $Enums.JobType
    jobrightMatchScore?: NullableFloatFieldUpdateOperationsInput | number | null
    jobrightBoard?: NullableStringFieldUpdateOperationsInput | string | null
    jobrightUrl?: NullableStringFieldUpdateOperationsInput | string | null
    externalUrl?: StringFieldUpdateOperationsInput | string
    status?: EnumApplicationStatusFieldUpdateOperationsInput | $Enums.ApplicationStatus
    invitedToInterview?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    appliedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    jobDescription?: JobDescriptionUncheckedUpdateOneWithoutJobApplicationNestedInput
    tailoredResumes?: TailoredResumeUncheckedUpdateManyWithoutJobApplicationNestedInput
    coverLetters?: CoverLetterUncheckedUpdateManyWithoutJobApplicationNestedInput
  }

  export type JobApplicationCreateManyInput = {
    id?: number
    userId: number
    source?: string
    jobrightJobId?: string | null
    title: string
    company: string
    location?: string | null
    jobType?: $Enums.JobType
    jobrightMatchScore?: number | null
    jobrightBoard?: string | null
    jobrightUrl?: string | null
    externalUrl: string
    status?: $Enums.ApplicationStatus
    invitedToInterview?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    appliedAt?: Date | string | null
  }

  export type JobApplicationUpdateManyMutationInput = {
    source?: StringFieldUpdateOperationsInput | string
    jobrightJobId?: NullableStringFieldUpdateOperationsInput | string | null
    title?: StringFieldUpdateOperationsInput | string
    company?: StringFieldUpdateOperationsInput | string
    location?: NullableStringFieldUpdateOperationsInput | string | null
    jobType?: EnumJobTypeFieldUpdateOperationsInput | $Enums.JobType
    jobrightMatchScore?: NullableFloatFieldUpdateOperationsInput | number | null
    jobrightBoard?: NullableStringFieldUpdateOperationsInput | string | null
    jobrightUrl?: NullableStringFieldUpdateOperationsInput | string | null
    externalUrl?: StringFieldUpdateOperationsInput | string
    status?: EnumApplicationStatusFieldUpdateOperationsInput | $Enums.ApplicationStatus
    invitedToInterview?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    appliedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type JobApplicationUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    userId?: IntFieldUpdateOperationsInput | number
    source?: StringFieldUpdateOperationsInput | string
    jobrightJobId?: NullableStringFieldUpdateOperationsInput | string | null
    title?: StringFieldUpdateOperationsInput | string
    company?: StringFieldUpdateOperationsInput | string
    location?: NullableStringFieldUpdateOperationsInput | string | null
    jobType?: EnumJobTypeFieldUpdateOperationsInput | $Enums.JobType
    jobrightMatchScore?: NullableFloatFieldUpdateOperationsInput | number | null
    jobrightBoard?: NullableStringFieldUpdateOperationsInput | string | null
    jobrightUrl?: NullableStringFieldUpdateOperationsInput | string | null
    externalUrl?: StringFieldUpdateOperationsInput | string
    status?: EnumApplicationStatusFieldUpdateOperationsInput | $Enums.ApplicationStatus
    invitedToInterview?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    appliedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type JobDescriptionCreateInput = {
    fullText: string
    source?: string
    createdAt?: Date | string
    jobApplication: JobApplicationCreateNestedOneWithoutJobDescriptionInput
  }

  export type JobDescriptionUncheckedCreateInput = {
    id?: number
    jobApplicationId: number
    fullText: string
    source?: string
    createdAt?: Date | string
  }

  export type JobDescriptionUpdateInput = {
    fullText?: StringFieldUpdateOperationsInput | string
    source?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    jobApplication?: JobApplicationUpdateOneRequiredWithoutJobDescriptionNestedInput
  }

  export type JobDescriptionUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    jobApplicationId?: IntFieldUpdateOperationsInput | number
    fullText?: StringFieldUpdateOperationsInput | string
    source?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type JobDescriptionCreateManyInput = {
    id?: number
    jobApplicationId: number
    fullText: string
    source?: string
    createdAt?: Date | string
  }

  export type JobDescriptionUpdateManyMutationInput = {
    fullText?: StringFieldUpdateOperationsInput | string
    source?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type JobDescriptionUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    jobApplicationId?: IntFieldUpdateOperationsInput | number
    fullText?: StringFieldUpdateOperationsInput | string
    source?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TailoredResumeCreateInput = {
    llmModel: string
    promptVersion: string
    outputText: string
    createdAt?: Date | string
    jobApplication: JobApplicationCreateNestedOneWithoutTailoredResumesInput
    baseResume: ResumeCreateNestedOneWithoutTailoredResumesInput
  }

  export type TailoredResumeUncheckedCreateInput = {
    id?: number
    jobApplicationId: number
    baseResumeId: number
    llmModel: string
    promptVersion: string
    outputText: string
    createdAt?: Date | string
  }

  export type TailoredResumeUpdateInput = {
    llmModel?: StringFieldUpdateOperationsInput | string
    promptVersion?: StringFieldUpdateOperationsInput | string
    outputText?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    jobApplication?: JobApplicationUpdateOneRequiredWithoutTailoredResumesNestedInput
    baseResume?: ResumeUpdateOneRequiredWithoutTailoredResumesNestedInput
  }

  export type TailoredResumeUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    jobApplicationId?: IntFieldUpdateOperationsInput | number
    baseResumeId?: IntFieldUpdateOperationsInput | number
    llmModel?: StringFieldUpdateOperationsInput | string
    promptVersion?: StringFieldUpdateOperationsInput | string
    outputText?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TailoredResumeCreateManyInput = {
    id?: number
    jobApplicationId: number
    baseResumeId: number
    llmModel: string
    promptVersion: string
    outputText: string
    createdAt?: Date | string
  }

  export type TailoredResumeUpdateManyMutationInput = {
    llmModel?: StringFieldUpdateOperationsInput | string
    promptVersion?: StringFieldUpdateOperationsInput | string
    outputText?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TailoredResumeUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    jobApplicationId?: IntFieldUpdateOperationsInput | number
    baseResumeId?: IntFieldUpdateOperationsInput | number
    llmModel?: StringFieldUpdateOperationsInput | string
    promptVersion?: StringFieldUpdateOperationsInput | string
    outputText?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CoverLetterCreateInput = {
    llmModel: string
    promptVersion: string
    outputText: string
    createdAt?: Date | string
    jobApplication: JobApplicationCreateNestedOneWithoutCoverLettersInput
    baseResume?: ResumeCreateNestedOneWithoutCoverLettersInput
  }

  export type CoverLetterUncheckedCreateInput = {
    id?: number
    jobApplicationId: number
    baseResumeId?: number | null
    llmModel: string
    promptVersion: string
    outputText: string
    createdAt?: Date | string
  }

  export type CoverLetterUpdateInput = {
    llmModel?: StringFieldUpdateOperationsInput | string
    promptVersion?: StringFieldUpdateOperationsInput | string
    outputText?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    jobApplication?: JobApplicationUpdateOneRequiredWithoutCoverLettersNestedInput
    baseResume?: ResumeUpdateOneWithoutCoverLettersNestedInput
  }

  export type CoverLetterUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    jobApplicationId?: IntFieldUpdateOperationsInput | number
    baseResumeId?: NullableIntFieldUpdateOperationsInput | number | null
    llmModel?: StringFieldUpdateOperationsInput | string
    promptVersion?: StringFieldUpdateOperationsInput | string
    outputText?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CoverLetterCreateManyInput = {
    id?: number
    jobApplicationId: number
    baseResumeId?: number | null
    llmModel: string
    promptVersion: string
    outputText: string
    createdAt?: Date | string
  }

  export type CoverLetterUpdateManyMutationInput = {
    llmModel?: StringFieldUpdateOperationsInput | string
    promptVersion?: StringFieldUpdateOperationsInput | string
    outputText?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CoverLetterUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    jobApplicationId?: IntFieldUpdateOperationsInput | number
    baseResumeId?: NullableIntFieldUpdateOperationsInput | number | null
    llmModel?: StringFieldUpdateOperationsInput | string
    promptVersion?: StringFieldUpdateOperationsInput | string
    outputText?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AppConfigCreateInput = {
    key: string
    value: string
    updatedAt?: Date | string
  }

  export type AppConfigUncheckedCreateInput = {
    key: string
    value: string
    updatedAt?: Date | string
  }

  export type AppConfigUpdateInput = {
    key?: StringFieldUpdateOperationsInput | string
    value?: StringFieldUpdateOperationsInput | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AppConfigUncheckedUpdateInput = {
    key?: StringFieldUpdateOperationsInput | string
    value?: StringFieldUpdateOperationsInput | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AppConfigCreateManyInput = {
    key: string
    value: string
    updatedAt?: Date | string
  }

  export type AppConfigUpdateManyMutationInput = {
    key?: StringFieldUpdateOperationsInput | string
    value?: StringFieldUpdateOperationsInput | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AppConfigUncheckedUpdateManyInput = {
    key?: StringFieldUpdateOperationsInput | string
    value?: StringFieldUpdateOperationsInput | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SkipRuleCreateInput = {
    type: $Enums.SkipRuleType
    pattern: string
    active?: boolean
    createdAt?: Date | string
  }

  export type SkipRuleUncheckedCreateInput = {
    id?: number
    type: $Enums.SkipRuleType
    pattern: string
    active?: boolean
    createdAt?: Date | string
  }

  export type SkipRuleUpdateInput = {
    type?: EnumSkipRuleTypeFieldUpdateOperationsInput | $Enums.SkipRuleType
    pattern?: StringFieldUpdateOperationsInput | string
    active?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SkipRuleUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    type?: EnumSkipRuleTypeFieldUpdateOperationsInput | $Enums.SkipRuleType
    pattern?: StringFieldUpdateOperationsInput | string
    active?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SkipRuleCreateManyInput = {
    id?: number
    type: $Enums.SkipRuleType
    pattern: string
    active?: boolean
    createdAt?: Date | string
  }

  export type SkipRuleUpdateManyMutationInput = {
    type?: EnumSkipRuleTypeFieldUpdateOperationsInput | $Enums.SkipRuleType
    pattern?: StringFieldUpdateOperationsInput | string
    active?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SkipRuleUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    type?: EnumSkipRuleTypeFieldUpdateOperationsInput | $Enums.SkipRuleType
    pattern?: StringFieldUpdateOperationsInput | string
    active?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserProfileCreateInput = {
    name: string
    email: string
    baseResumeText: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UserProfileUncheckedCreateInput = {
    id?: number
    name: string
    email: string
    baseResumeText: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UserProfileUpdateInput = {
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    baseResumeText?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserProfileUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    baseResumeText?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserProfileCreateManyInput = {
    id?: number
    name: string
    email: string
    baseResumeText: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UserProfileUpdateManyMutationInput = {
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    baseResumeText?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserProfileUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    baseResumeText?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ScanLogCreateInput = {
    board: string
    jobsFound?: number
    jobsSaved?: number
    errors?: string | null
    durationMs?: number | null
    createdAt?: Date | string
  }

  export type ScanLogUncheckedCreateInput = {
    id?: number
    board: string
    jobsFound?: number
    jobsSaved?: number
    errors?: string | null
    durationMs?: number | null
    createdAt?: Date | string
  }

  export type ScanLogUpdateInput = {
    board?: StringFieldUpdateOperationsInput | string
    jobsFound?: IntFieldUpdateOperationsInput | number
    jobsSaved?: IntFieldUpdateOperationsInput | number
    errors?: NullableStringFieldUpdateOperationsInput | string | null
    durationMs?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ScanLogUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    board?: StringFieldUpdateOperationsInput | string
    jobsFound?: IntFieldUpdateOperationsInput | number
    jobsSaved?: IntFieldUpdateOperationsInput | number
    errors?: NullableStringFieldUpdateOperationsInput | string | null
    durationMs?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ScanLogCreateManyInput = {
    id?: number
    board: string
    jobsFound?: number
    jobsSaved?: number
    errors?: string | null
    durationMs?: number | null
    createdAt?: Date | string
  }

  export type ScanLogUpdateManyMutationInput = {
    board?: StringFieldUpdateOperationsInput | string
    jobsFound?: IntFieldUpdateOperationsInput | number
    jobsSaved?: IntFieldUpdateOperationsInput | number
    errors?: NullableStringFieldUpdateOperationsInput | string | null
    durationMs?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ScanLogUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    board?: StringFieldUpdateOperationsInput | string
    jobsFound?: IntFieldUpdateOperationsInput | number
    jobsSaved?: IntFieldUpdateOperationsInput | number
    errors?: NullableStringFieldUpdateOperationsInput | string | null
    durationMs?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type GenerationLogCreateInput = {
    jobApplicationId: number
    model: string
    promptVersion: string
    success?: boolean
    error?: string | null
    tokensUsed?: number | null
    durationMs?: number | null
    createdAt?: Date | string
  }

  export type GenerationLogUncheckedCreateInput = {
    id?: number
    jobApplicationId: number
    model: string
    promptVersion: string
    success?: boolean
    error?: string | null
    tokensUsed?: number | null
    durationMs?: number | null
    createdAt?: Date | string
  }

  export type GenerationLogUpdateInput = {
    jobApplicationId?: IntFieldUpdateOperationsInput | number
    model?: StringFieldUpdateOperationsInput | string
    promptVersion?: StringFieldUpdateOperationsInput | string
    success?: BoolFieldUpdateOperationsInput | boolean
    error?: NullableStringFieldUpdateOperationsInput | string | null
    tokensUsed?: NullableIntFieldUpdateOperationsInput | number | null
    durationMs?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type GenerationLogUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    jobApplicationId?: IntFieldUpdateOperationsInput | number
    model?: StringFieldUpdateOperationsInput | string
    promptVersion?: StringFieldUpdateOperationsInput | string
    success?: BoolFieldUpdateOperationsInput | boolean
    error?: NullableStringFieldUpdateOperationsInput | string | null
    tokensUsed?: NullableIntFieldUpdateOperationsInput | number | null
    durationMs?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type GenerationLogCreateManyInput = {
    id?: number
    jobApplicationId: number
    model: string
    promptVersion: string
    success?: boolean
    error?: string | null
    tokensUsed?: number | null
    durationMs?: number | null
    createdAt?: Date | string
  }

  export type GenerationLogUpdateManyMutationInput = {
    jobApplicationId?: IntFieldUpdateOperationsInput | number
    model?: StringFieldUpdateOperationsInput | string
    promptVersion?: StringFieldUpdateOperationsInput | string
    success?: BoolFieldUpdateOperationsInput | boolean
    error?: NullableStringFieldUpdateOperationsInput | string | null
    tokensUsed?: NullableIntFieldUpdateOperationsInput | number | null
    durationMs?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type GenerationLogUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    jobApplicationId?: IntFieldUpdateOperationsInput | number
    model?: StringFieldUpdateOperationsInput | string
    promptVersion?: StringFieldUpdateOperationsInput | string
    success?: BoolFieldUpdateOperationsInput | boolean
    error?: NullableStringFieldUpdateOperationsInput | string | null
    tokensUsed?: NullableIntFieldUpdateOperationsInput | number | null
    durationMs?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type ResumeListRelationFilter = {
    every?: ResumeWhereInput
    some?: ResumeWhereInput
    none?: ResumeWhereInput
  }

  export type JobApplicationListRelationFilter = {
    every?: JobApplicationWhereInput
    some?: JobApplicationWhereInput
    none?: JobApplicationWhereInput
  }

  export type OneClickJobListRelationFilter = {
    every?: OneClickJobWhereInput
    some?: OneClickJobWhereInput
    none?: OneClickJobWhereInput
  }

  export type ResumeOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type JobApplicationOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type OneClickJobOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type UserCountOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    passwordHash?: SortOrder
    createdAt?: SortOrder
  }

  export type UserAvgOrderByAggregateInput = {
    id?: SortOrder
  }

  export type UserMaxOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    passwordHash?: SortOrder
    createdAt?: SortOrder
  }

  export type UserMinOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    passwordHash?: SortOrder
    createdAt?: SortOrder
  }

  export type UserSumOrderByAggregateInput = {
    id?: SortOrder
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type DateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type UserRelationFilter = {
    is?: UserWhereInput
    isNot?: UserWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type OneClickJobUserIdExternalUrlCompoundUniqueInput = {
    userId: number
    externalUrl: string
  }

  export type OneClickJobCountOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    source?: SortOrder
    title?: SortOrder
    company?: SortOrder
    externalUrl?: SortOrder
    fullText?: SortOrder
    appliedAt?: SortOrder
    createdAt?: SortOrder
  }

  export type OneClickJobAvgOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
  }

  export type OneClickJobMaxOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    source?: SortOrder
    title?: SortOrder
    company?: SortOrder
    externalUrl?: SortOrder
    fullText?: SortOrder
    appliedAt?: SortOrder
    createdAt?: SortOrder
  }

  export type OneClickJobMinOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    source?: SortOrder
    title?: SortOrder
    company?: SortOrder
    externalUrl?: SortOrder
    fullText?: SortOrder
    appliedAt?: SortOrder
    createdAt?: SortOrder
  }

  export type OneClickJobSumOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
  }

  export type DateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type TailoredResumeListRelationFilter = {
    every?: TailoredResumeWhereInput
    some?: TailoredResumeWhereInput
    none?: TailoredResumeWhereInput
  }

  export type CoverLetterListRelationFilter = {
    every?: CoverLetterWhereInput
    some?: CoverLetterWhereInput
    none?: CoverLetterWhereInput
  }

  export type TailoredResumeOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type CoverLetterOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type ResumeCountOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    name?: SortOrder
    rawText?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ResumeAvgOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
  }

  export type ResumeMaxOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    name?: SortOrder
    rawText?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ResumeMinOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    name?: SortOrder
    rawText?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ResumeSumOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type EnumJobTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.JobType | EnumJobTypeFieldRefInput<$PrismaModel>
    in?: $Enums.JobType[] | ListEnumJobTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.JobType[] | ListEnumJobTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumJobTypeFilter<$PrismaModel> | $Enums.JobType
  }

  export type FloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type EnumApplicationStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.ApplicationStatus | EnumApplicationStatusFieldRefInput<$PrismaModel>
    in?: $Enums.ApplicationStatus[] | ListEnumApplicationStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.ApplicationStatus[] | ListEnumApplicationStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumApplicationStatusFilter<$PrismaModel> | $Enums.ApplicationStatus
  }

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type JobDescriptionNullableRelationFilter = {
    is?: JobDescriptionWhereInput | null
    isNot?: JobDescriptionWhereInput | null
  }

  export type JobApplicationUserIdExternalUrlCompoundUniqueInput = {
    userId: number
    externalUrl: string
  }

  export type JobApplicationUserIdTitleCompanyCompoundUniqueInput = {
    userId: number
    title: string
    company: string
  }

  export type JobApplicationCountOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    source?: SortOrder
    jobrightJobId?: SortOrder
    title?: SortOrder
    company?: SortOrder
    location?: SortOrder
    jobType?: SortOrder
    jobrightMatchScore?: SortOrder
    jobrightBoard?: SortOrder
    jobrightUrl?: SortOrder
    externalUrl?: SortOrder
    status?: SortOrder
    invitedToInterview?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    appliedAt?: SortOrder
  }

  export type JobApplicationAvgOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    jobrightMatchScore?: SortOrder
  }

  export type JobApplicationMaxOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    source?: SortOrder
    jobrightJobId?: SortOrder
    title?: SortOrder
    company?: SortOrder
    location?: SortOrder
    jobType?: SortOrder
    jobrightMatchScore?: SortOrder
    jobrightBoard?: SortOrder
    jobrightUrl?: SortOrder
    externalUrl?: SortOrder
    status?: SortOrder
    invitedToInterview?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    appliedAt?: SortOrder
  }

  export type JobApplicationMinOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    source?: SortOrder
    jobrightJobId?: SortOrder
    title?: SortOrder
    company?: SortOrder
    location?: SortOrder
    jobType?: SortOrder
    jobrightMatchScore?: SortOrder
    jobrightBoard?: SortOrder
    jobrightUrl?: SortOrder
    externalUrl?: SortOrder
    status?: SortOrder
    invitedToInterview?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    appliedAt?: SortOrder
  }

  export type JobApplicationSumOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    jobrightMatchScore?: SortOrder
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type EnumJobTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.JobType | EnumJobTypeFieldRefInput<$PrismaModel>
    in?: $Enums.JobType[] | ListEnumJobTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.JobType[] | ListEnumJobTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumJobTypeWithAggregatesFilter<$PrismaModel> | $Enums.JobType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumJobTypeFilter<$PrismaModel>
    _max?: NestedEnumJobTypeFilter<$PrismaModel>
  }

  export type FloatNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedFloatNullableFilter<$PrismaModel>
    _min?: NestedFloatNullableFilter<$PrismaModel>
    _max?: NestedFloatNullableFilter<$PrismaModel>
  }

  export type EnumApplicationStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.ApplicationStatus | EnumApplicationStatusFieldRefInput<$PrismaModel>
    in?: $Enums.ApplicationStatus[] | ListEnumApplicationStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.ApplicationStatus[] | ListEnumApplicationStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumApplicationStatusWithAggregatesFilter<$PrismaModel> | $Enums.ApplicationStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumApplicationStatusFilter<$PrismaModel>
    _max?: NestedEnumApplicationStatusFilter<$PrismaModel>
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type JobApplicationRelationFilter = {
    is?: JobApplicationWhereInput
    isNot?: JobApplicationWhereInput
  }

  export type JobDescriptionCountOrderByAggregateInput = {
    id?: SortOrder
    jobApplicationId?: SortOrder
    fullText?: SortOrder
    source?: SortOrder
    createdAt?: SortOrder
  }

  export type JobDescriptionAvgOrderByAggregateInput = {
    id?: SortOrder
    jobApplicationId?: SortOrder
  }

  export type JobDescriptionMaxOrderByAggregateInput = {
    id?: SortOrder
    jobApplicationId?: SortOrder
    fullText?: SortOrder
    source?: SortOrder
    createdAt?: SortOrder
  }

  export type JobDescriptionMinOrderByAggregateInput = {
    id?: SortOrder
    jobApplicationId?: SortOrder
    fullText?: SortOrder
    source?: SortOrder
    createdAt?: SortOrder
  }

  export type JobDescriptionSumOrderByAggregateInput = {
    id?: SortOrder
    jobApplicationId?: SortOrder
  }

  export type ResumeRelationFilter = {
    is?: ResumeWhereInput
    isNot?: ResumeWhereInput
  }

  export type TailoredResumeCountOrderByAggregateInput = {
    id?: SortOrder
    jobApplicationId?: SortOrder
    baseResumeId?: SortOrder
    llmModel?: SortOrder
    promptVersion?: SortOrder
    outputText?: SortOrder
    createdAt?: SortOrder
  }

  export type TailoredResumeAvgOrderByAggregateInput = {
    id?: SortOrder
    jobApplicationId?: SortOrder
    baseResumeId?: SortOrder
  }

  export type TailoredResumeMaxOrderByAggregateInput = {
    id?: SortOrder
    jobApplicationId?: SortOrder
    baseResumeId?: SortOrder
    llmModel?: SortOrder
    promptVersion?: SortOrder
    outputText?: SortOrder
    createdAt?: SortOrder
  }

  export type TailoredResumeMinOrderByAggregateInput = {
    id?: SortOrder
    jobApplicationId?: SortOrder
    baseResumeId?: SortOrder
    llmModel?: SortOrder
    promptVersion?: SortOrder
    outputText?: SortOrder
    createdAt?: SortOrder
  }

  export type TailoredResumeSumOrderByAggregateInput = {
    id?: SortOrder
    jobApplicationId?: SortOrder
    baseResumeId?: SortOrder
  }

  export type IntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type ResumeNullableRelationFilter = {
    is?: ResumeWhereInput | null
    isNot?: ResumeWhereInput | null
  }

  export type CoverLetterCountOrderByAggregateInput = {
    id?: SortOrder
    jobApplicationId?: SortOrder
    baseResumeId?: SortOrder
    llmModel?: SortOrder
    promptVersion?: SortOrder
    outputText?: SortOrder
    createdAt?: SortOrder
  }

  export type CoverLetterAvgOrderByAggregateInput = {
    id?: SortOrder
    jobApplicationId?: SortOrder
    baseResumeId?: SortOrder
  }

  export type CoverLetterMaxOrderByAggregateInput = {
    id?: SortOrder
    jobApplicationId?: SortOrder
    baseResumeId?: SortOrder
    llmModel?: SortOrder
    promptVersion?: SortOrder
    outputText?: SortOrder
    createdAt?: SortOrder
  }

  export type CoverLetterMinOrderByAggregateInput = {
    id?: SortOrder
    jobApplicationId?: SortOrder
    baseResumeId?: SortOrder
    llmModel?: SortOrder
    promptVersion?: SortOrder
    outputText?: SortOrder
    createdAt?: SortOrder
  }

  export type CoverLetterSumOrderByAggregateInput = {
    id?: SortOrder
    jobApplicationId?: SortOrder
    baseResumeId?: SortOrder
  }

  export type IntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type AppConfigCountOrderByAggregateInput = {
    key?: SortOrder
    value?: SortOrder
    updatedAt?: SortOrder
  }

  export type AppConfigMaxOrderByAggregateInput = {
    key?: SortOrder
    value?: SortOrder
    updatedAt?: SortOrder
  }

  export type AppConfigMinOrderByAggregateInput = {
    key?: SortOrder
    value?: SortOrder
    updatedAt?: SortOrder
  }

  export type EnumSkipRuleTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.SkipRuleType | EnumSkipRuleTypeFieldRefInput<$PrismaModel>
    in?: $Enums.SkipRuleType[] | ListEnumSkipRuleTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.SkipRuleType[] | ListEnumSkipRuleTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumSkipRuleTypeFilter<$PrismaModel> | $Enums.SkipRuleType
  }

  export type SkipRuleCountOrderByAggregateInput = {
    id?: SortOrder
    type?: SortOrder
    pattern?: SortOrder
    active?: SortOrder
    createdAt?: SortOrder
  }

  export type SkipRuleAvgOrderByAggregateInput = {
    id?: SortOrder
  }

  export type SkipRuleMaxOrderByAggregateInput = {
    id?: SortOrder
    type?: SortOrder
    pattern?: SortOrder
    active?: SortOrder
    createdAt?: SortOrder
  }

  export type SkipRuleMinOrderByAggregateInput = {
    id?: SortOrder
    type?: SortOrder
    pattern?: SortOrder
    active?: SortOrder
    createdAt?: SortOrder
  }

  export type SkipRuleSumOrderByAggregateInput = {
    id?: SortOrder
  }

  export type EnumSkipRuleTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.SkipRuleType | EnumSkipRuleTypeFieldRefInput<$PrismaModel>
    in?: $Enums.SkipRuleType[] | ListEnumSkipRuleTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.SkipRuleType[] | ListEnumSkipRuleTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumSkipRuleTypeWithAggregatesFilter<$PrismaModel> | $Enums.SkipRuleType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumSkipRuleTypeFilter<$PrismaModel>
    _max?: NestedEnumSkipRuleTypeFilter<$PrismaModel>
  }

  export type UserProfileCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    email?: SortOrder
    baseResumeText?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UserProfileAvgOrderByAggregateInput = {
    id?: SortOrder
  }

  export type UserProfileMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    email?: SortOrder
    baseResumeText?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UserProfileMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    email?: SortOrder
    baseResumeText?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UserProfileSumOrderByAggregateInput = {
    id?: SortOrder
  }

  export type ScanLogCountOrderByAggregateInput = {
    id?: SortOrder
    board?: SortOrder
    jobsFound?: SortOrder
    jobsSaved?: SortOrder
    errors?: SortOrder
    durationMs?: SortOrder
    createdAt?: SortOrder
  }

  export type ScanLogAvgOrderByAggregateInput = {
    id?: SortOrder
    jobsFound?: SortOrder
    jobsSaved?: SortOrder
    durationMs?: SortOrder
  }

  export type ScanLogMaxOrderByAggregateInput = {
    id?: SortOrder
    board?: SortOrder
    jobsFound?: SortOrder
    jobsSaved?: SortOrder
    errors?: SortOrder
    durationMs?: SortOrder
    createdAt?: SortOrder
  }

  export type ScanLogMinOrderByAggregateInput = {
    id?: SortOrder
    board?: SortOrder
    jobsFound?: SortOrder
    jobsSaved?: SortOrder
    errors?: SortOrder
    durationMs?: SortOrder
    createdAt?: SortOrder
  }

  export type ScanLogSumOrderByAggregateInput = {
    id?: SortOrder
    jobsFound?: SortOrder
    jobsSaved?: SortOrder
    durationMs?: SortOrder
  }

  export type GenerationLogCountOrderByAggregateInput = {
    id?: SortOrder
    jobApplicationId?: SortOrder
    model?: SortOrder
    promptVersion?: SortOrder
    success?: SortOrder
    error?: SortOrder
    tokensUsed?: SortOrder
    durationMs?: SortOrder
    createdAt?: SortOrder
  }

  export type GenerationLogAvgOrderByAggregateInput = {
    id?: SortOrder
    jobApplicationId?: SortOrder
    tokensUsed?: SortOrder
    durationMs?: SortOrder
  }

  export type GenerationLogMaxOrderByAggregateInput = {
    id?: SortOrder
    jobApplicationId?: SortOrder
    model?: SortOrder
    promptVersion?: SortOrder
    success?: SortOrder
    error?: SortOrder
    tokensUsed?: SortOrder
    durationMs?: SortOrder
    createdAt?: SortOrder
  }

  export type GenerationLogMinOrderByAggregateInput = {
    id?: SortOrder
    jobApplicationId?: SortOrder
    model?: SortOrder
    promptVersion?: SortOrder
    success?: SortOrder
    error?: SortOrder
    tokensUsed?: SortOrder
    durationMs?: SortOrder
    createdAt?: SortOrder
  }

  export type GenerationLogSumOrderByAggregateInput = {
    id?: SortOrder
    jobApplicationId?: SortOrder
    tokensUsed?: SortOrder
    durationMs?: SortOrder
  }

  export type ResumeCreateNestedManyWithoutUserInput = {
    create?: XOR<ResumeCreateWithoutUserInput, ResumeUncheckedCreateWithoutUserInput> | ResumeCreateWithoutUserInput[] | ResumeUncheckedCreateWithoutUserInput[]
    connectOrCreate?: ResumeCreateOrConnectWithoutUserInput | ResumeCreateOrConnectWithoutUserInput[]
    createMany?: ResumeCreateManyUserInputEnvelope
    connect?: ResumeWhereUniqueInput | ResumeWhereUniqueInput[]
  }

  export type JobApplicationCreateNestedManyWithoutUserInput = {
    create?: XOR<JobApplicationCreateWithoutUserInput, JobApplicationUncheckedCreateWithoutUserInput> | JobApplicationCreateWithoutUserInput[] | JobApplicationUncheckedCreateWithoutUserInput[]
    connectOrCreate?: JobApplicationCreateOrConnectWithoutUserInput | JobApplicationCreateOrConnectWithoutUserInput[]
    createMany?: JobApplicationCreateManyUserInputEnvelope
    connect?: JobApplicationWhereUniqueInput | JobApplicationWhereUniqueInput[]
  }

  export type OneClickJobCreateNestedManyWithoutUserInput = {
    create?: XOR<OneClickJobCreateWithoutUserInput, OneClickJobUncheckedCreateWithoutUserInput> | OneClickJobCreateWithoutUserInput[] | OneClickJobUncheckedCreateWithoutUserInput[]
    connectOrCreate?: OneClickJobCreateOrConnectWithoutUserInput | OneClickJobCreateOrConnectWithoutUserInput[]
    createMany?: OneClickJobCreateManyUserInputEnvelope
    connect?: OneClickJobWhereUniqueInput | OneClickJobWhereUniqueInput[]
  }

  export type ResumeUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<ResumeCreateWithoutUserInput, ResumeUncheckedCreateWithoutUserInput> | ResumeCreateWithoutUserInput[] | ResumeUncheckedCreateWithoutUserInput[]
    connectOrCreate?: ResumeCreateOrConnectWithoutUserInput | ResumeCreateOrConnectWithoutUserInput[]
    createMany?: ResumeCreateManyUserInputEnvelope
    connect?: ResumeWhereUniqueInput | ResumeWhereUniqueInput[]
  }

  export type JobApplicationUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<JobApplicationCreateWithoutUserInput, JobApplicationUncheckedCreateWithoutUserInput> | JobApplicationCreateWithoutUserInput[] | JobApplicationUncheckedCreateWithoutUserInput[]
    connectOrCreate?: JobApplicationCreateOrConnectWithoutUserInput | JobApplicationCreateOrConnectWithoutUserInput[]
    createMany?: JobApplicationCreateManyUserInputEnvelope
    connect?: JobApplicationWhereUniqueInput | JobApplicationWhereUniqueInput[]
  }

  export type OneClickJobUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<OneClickJobCreateWithoutUserInput, OneClickJobUncheckedCreateWithoutUserInput> | OneClickJobCreateWithoutUserInput[] | OneClickJobUncheckedCreateWithoutUserInput[]
    connectOrCreate?: OneClickJobCreateOrConnectWithoutUserInput | OneClickJobCreateOrConnectWithoutUserInput[]
    createMany?: OneClickJobCreateManyUserInputEnvelope
    connect?: OneClickJobWhereUniqueInput | OneClickJobWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type ResumeUpdateManyWithoutUserNestedInput = {
    create?: XOR<ResumeCreateWithoutUserInput, ResumeUncheckedCreateWithoutUserInput> | ResumeCreateWithoutUserInput[] | ResumeUncheckedCreateWithoutUserInput[]
    connectOrCreate?: ResumeCreateOrConnectWithoutUserInput | ResumeCreateOrConnectWithoutUserInput[]
    upsert?: ResumeUpsertWithWhereUniqueWithoutUserInput | ResumeUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: ResumeCreateManyUserInputEnvelope
    set?: ResumeWhereUniqueInput | ResumeWhereUniqueInput[]
    disconnect?: ResumeWhereUniqueInput | ResumeWhereUniqueInput[]
    delete?: ResumeWhereUniqueInput | ResumeWhereUniqueInput[]
    connect?: ResumeWhereUniqueInput | ResumeWhereUniqueInput[]
    update?: ResumeUpdateWithWhereUniqueWithoutUserInput | ResumeUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: ResumeUpdateManyWithWhereWithoutUserInput | ResumeUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: ResumeScalarWhereInput | ResumeScalarWhereInput[]
  }

  export type JobApplicationUpdateManyWithoutUserNestedInput = {
    create?: XOR<JobApplicationCreateWithoutUserInput, JobApplicationUncheckedCreateWithoutUserInput> | JobApplicationCreateWithoutUserInput[] | JobApplicationUncheckedCreateWithoutUserInput[]
    connectOrCreate?: JobApplicationCreateOrConnectWithoutUserInput | JobApplicationCreateOrConnectWithoutUserInput[]
    upsert?: JobApplicationUpsertWithWhereUniqueWithoutUserInput | JobApplicationUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: JobApplicationCreateManyUserInputEnvelope
    set?: JobApplicationWhereUniqueInput | JobApplicationWhereUniqueInput[]
    disconnect?: JobApplicationWhereUniqueInput | JobApplicationWhereUniqueInput[]
    delete?: JobApplicationWhereUniqueInput | JobApplicationWhereUniqueInput[]
    connect?: JobApplicationWhereUniqueInput | JobApplicationWhereUniqueInput[]
    update?: JobApplicationUpdateWithWhereUniqueWithoutUserInput | JobApplicationUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: JobApplicationUpdateManyWithWhereWithoutUserInput | JobApplicationUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: JobApplicationScalarWhereInput | JobApplicationScalarWhereInput[]
  }

  export type OneClickJobUpdateManyWithoutUserNestedInput = {
    create?: XOR<OneClickJobCreateWithoutUserInput, OneClickJobUncheckedCreateWithoutUserInput> | OneClickJobCreateWithoutUserInput[] | OneClickJobUncheckedCreateWithoutUserInput[]
    connectOrCreate?: OneClickJobCreateOrConnectWithoutUserInput | OneClickJobCreateOrConnectWithoutUserInput[]
    upsert?: OneClickJobUpsertWithWhereUniqueWithoutUserInput | OneClickJobUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: OneClickJobCreateManyUserInputEnvelope
    set?: OneClickJobWhereUniqueInput | OneClickJobWhereUniqueInput[]
    disconnect?: OneClickJobWhereUniqueInput | OneClickJobWhereUniqueInput[]
    delete?: OneClickJobWhereUniqueInput | OneClickJobWhereUniqueInput[]
    connect?: OneClickJobWhereUniqueInput | OneClickJobWhereUniqueInput[]
    update?: OneClickJobUpdateWithWhereUniqueWithoutUserInput | OneClickJobUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: OneClickJobUpdateManyWithWhereWithoutUserInput | OneClickJobUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: OneClickJobScalarWhereInput | OneClickJobScalarWhereInput[]
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type ResumeUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<ResumeCreateWithoutUserInput, ResumeUncheckedCreateWithoutUserInput> | ResumeCreateWithoutUserInput[] | ResumeUncheckedCreateWithoutUserInput[]
    connectOrCreate?: ResumeCreateOrConnectWithoutUserInput | ResumeCreateOrConnectWithoutUserInput[]
    upsert?: ResumeUpsertWithWhereUniqueWithoutUserInput | ResumeUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: ResumeCreateManyUserInputEnvelope
    set?: ResumeWhereUniqueInput | ResumeWhereUniqueInput[]
    disconnect?: ResumeWhereUniqueInput | ResumeWhereUniqueInput[]
    delete?: ResumeWhereUniqueInput | ResumeWhereUniqueInput[]
    connect?: ResumeWhereUniqueInput | ResumeWhereUniqueInput[]
    update?: ResumeUpdateWithWhereUniqueWithoutUserInput | ResumeUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: ResumeUpdateManyWithWhereWithoutUserInput | ResumeUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: ResumeScalarWhereInput | ResumeScalarWhereInput[]
  }

  export type JobApplicationUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<JobApplicationCreateWithoutUserInput, JobApplicationUncheckedCreateWithoutUserInput> | JobApplicationCreateWithoutUserInput[] | JobApplicationUncheckedCreateWithoutUserInput[]
    connectOrCreate?: JobApplicationCreateOrConnectWithoutUserInput | JobApplicationCreateOrConnectWithoutUserInput[]
    upsert?: JobApplicationUpsertWithWhereUniqueWithoutUserInput | JobApplicationUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: JobApplicationCreateManyUserInputEnvelope
    set?: JobApplicationWhereUniqueInput | JobApplicationWhereUniqueInput[]
    disconnect?: JobApplicationWhereUniqueInput | JobApplicationWhereUniqueInput[]
    delete?: JobApplicationWhereUniqueInput | JobApplicationWhereUniqueInput[]
    connect?: JobApplicationWhereUniqueInput | JobApplicationWhereUniqueInput[]
    update?: JobApplicationUpdateWithWhereUniqueWithoutUserInput | JobApplicationUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: JobApplicationUpdateManyWithWhereWithoutUserInput | JobApplicationUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: JobApplicationScalarWhereInput | JobApplicationScalarWhereInput[]
  }

  export type OneClickJobUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<OneClickJobCreateWithoutUserInput, OneClickJobUncheckedCreateWithoutUserInput> | OneClickJobCreateWithoutUserInput[] | OneClickJobUncheckedCreateWithoutUserInput[]
    connectOrCreate?: OneClickJobCreateOrConnectWithoutUserInput | OneClickJobCreateOrConnectWithoutUserInput[]
    upsert?: OneClickJobUpsertWithWhereUniqueWithoutUserInput | OneClickJobUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: OneClickJobCreateManyUserInputEnvelope
    set?: OneClickJobWhereUniqueInput | OneClickJobWhereUniqueInput[]
    disconnect?: OneClickJobWhereUniqueInput | OneClickJobWhereUniqueInput[]
    delete?: OneClickJobWhereUniqueInput | OneClickJobWhereUniqueInput[]
    connect?: OneClickJobWhereUniqueInput | OneClickJobWhereUniqueInput[]
    update?: OneClickJobUpdateWithWhereUniqueWithoutUserInput | OneClickJobUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: OneClickJobUpdateManyWithWhereWithoutUserInput | OneClickJobUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: OneClickJobScalarWhereInput | OneClickJobScalarWhereInput[]
  }

  export type UserCreateNestedOneWithoutOneClickJobsInput = {
    create?: XOR<UserCreateWithoutOneClickJobsInput, UserUncheckedCreateWithoutOneClickJobsInput>
    connectOrCreate?: UserCreateOrConnectWithoutOneClickJobsInput
    connect?: UserWhereUniqueInput
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type UserUpdateOneRequiredWithoutOneClickJobsNestedInput = {
    create?: XOR<UserCreateWithoutOneClickJobsInput, UserUncheckedCreateWithoutOneClickJobsInput>
    connectOrCreate?: UserCreateOrConnectWithoutOneClickJobsInput
    upsert?: UserUpsertWithoutOneClickJobsInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutOneClickJobsInput, UserUpdateWithoutOneClickJobsInput>, UserUncheckedUpdateWithoutOneClickJobsInput>
  }

  export type UserCreateNestedOneWithoutResumesInput = {
    create?: XOR<UserCreateWithoutResumesInput, UserUncheckedCreateWithoutResumesInput>
    connectOrCreate?: UserCreateOrConnectWithoutResumesInput
    connect?: UserWhereUniqueInput
  }

  export type TailoredResumeCreateNestedManyWithoutBaseResumeInput = {
    create?: XOR<TailoredResumeCreateWithoutBaseResumeInput, TailoredResumeUncheckedCreateWithoutBaseResumeInput> | TailoredResumeCreateWithoutBaseResumeInput[] | TailoredResumeUncheckedCreateWithoutBaseResumeInput[]
    connectOrCreate?: TailoredResumeCreateOrConnectWithoutBaseResumeInput | TailoredResumeCreateOrConnectWithoutBaseResumeInput[]
    createMany?: TailoredResumeCreateManyBaseResumeInputEnvelope
    connect?: TailoredResumeWhereUniqueInput | TailoredResumeWhereUniqueInput[]
  }

  export type CoverLetterCreateNestedManyWithoutBaseResumeInput = {
    create?: XOR<CoverLetterCreateWithoutBaseResumeInput, CoverLetterUncheckedCreateWithoutBaseResumeInput> | CoverLetterCreateWithoutBaseResumeInput[] | CoverLetterUncheckedCreateWithoutBaseResumeInput[]
    connectOrCreate?: CoverLetterCreateOrConnectWithoutBaseResumeInput | CoverLetterCreateOrConnectWithoutBaseResumeInput[]
    createMany?: CoverLetterCreateManyBaseResumeInputEnvelope
    connect?: CoverLetterWhereUniqueInput | CoverLetterWhereUniqueInput[]
  }

  export type TailoredResumeUncheckedCreateNestedManyWithoutBaseResumeInput = {
    create?: XOR<TailoredResumeCreateWithoutBaseResumeInput, TailoredResumeUncheckedCreateWithoutBaseResumeInput> | TailoredResumeCreateWithoutBaseResumeInput[] | TailoredResumeUncheckedCreateWithoutBaseResumeInput[]
    connectOrCreate?: TailoredResumeCreateOrConnectWithoutBaseResumeInput | TailoredResumeCreateOrConnectWithoutBaseResumeInput[]
    createMany?: TailoredResumeCreateManyBaseResumeInputEnvelope
    connect?: TailoredResumeWhereUniqueInput | TailoredResumeWhereUniqueInput[]
  }

  export type CoverLetterUncheckedCreateNestedManyWithoutBaseResumeInput = {
    create?: XOR<CoverLetterCreateWithoutBaseResumeInput, CoverLetterUncheckedCreateWithoutBaseResumeInput> | CoverLetterCreateWithoutBaseResumeInput[] | CoverLetterUncheckedCreateWithoutBaseResumeInput[]
    connectOrCreate?: CoverLetterCreateOrConnectWithoutBaseResumeInput | CoverLetterCreateOrConnectWithoutBaseResumeInput[]
    createMany?: CoverLetterCreateManyBaseResumeInputEnvelope
    connect?: CoverLetterWhereUniqueInput | CoverLetterWhereUniqueInput[]
  }

  export type UserUpdateOneRequiredWithoutResumesNestedInput = {
    create?: XOR<UserCreateWithoutResumesInput, UserUncheckedCreateWithoutResumesInput>
    connectOrCreate?: UserCreateOrConnectWithoutResumesInput
    upsert?: UserUpsertWithoutResumesInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutResumesInput, UserUpdateWithoutResumesInput>, UserUncheckedUpdateWithoutResumesInput>
  }

  export type TailoredResumeUpdateManyWithoutBaseResumeNestedInput = {
    create?: XOR<TailoredResumeCreateWithoutBaseResumeInput, TailoredResumeUncheckedCreateWithoutBaseResumeInput> | TailoredResumeCreateWithoutBaseResumeInput[] | TailoredResumeUncheckedCreateWithoutBaseResumeInput[]
    connectOrCreate?: TailoredResumeCreateOrConnectWithoutBaseResumeInput | TailoredResumeCreateOrConnectWithoutBaseResumeInput[]
    upsert?: TailoredResumeUpsertWithWhereUniqueWithoutBaseResumeInput | TailoredResumeUpsertWithWhereUniqueWithoutBaseResumeInput[]
    createMany?: TailoredResumeCreateManyBaseResumeInputEnvelope
    set?: TailoredResumeWhereUniqueInput | TailoredResumeWhereUniqueInput[]
    disconnect?: TailoredResumeWhereUniqueInput | TailoredResumeWhereUniqueInput[]
    delete?: TailoredResumeWhereUniqueInput | TailoredResumeWhereUniqueInput[]
    connect?: TailoredResumeWhereUniqueInput | TailoredResumeWhereUniqueInput[]
    update?: TailoredResumeUpdateWithWhereUniqueWithoutBaseResumeInput | TailoredResumeUpdateWithWhereUniqueWithoutBaseResumeInput[]
    updateMany?: TailoredResumeUpdateManyWithWhereWithoutBaseResumeInput | TailoredResumeUpdateManyWithWhereWithoutBaseResumeInput[]
    deleteMany?: TailoredResumeScalarWhereInput | TailoredResumeScalarWhereInput[]
  }

  export type CoverLetterUpdateManyWithoutBaseResumeNestedInput = {
    create?: XOR<CoverLetterCreateWithoutBaseResumeInput, CoverLetterUncheckedCreateWithoutBaseResumeInput> | CoverLetterCreateWithoutBaseResumeInput[] | CoverLetterUncheckedCreateWithoutBaseResumeInput[]
    connectOrCreate?: CoverLetterCreateOrConnectWithoutBaseResumeInput | CoverLetterCreateOrConnectWithoutBaseResumeInput[]
    upsert?: CoverLetterUpsertWithWhereUniqueWithoutBaseResumeInput | CoverLetterUpsertWithWhereUniqueWithoutBaseResumeInput[]
    createMany?: CoverLetterCreateManyBaseResumeInputEnvelope
    set?: CoverLetterWhereUniqueInput | CoverLetterWhereUniqueInput[]
    disconnect?: CoverLetterWhereUniqueInput | CoverLetterWhereUniqueInput[]
    delete?: CoverLetterWhereUniqueInput | CoverLetterWhereUniqueInput[]
    connect?: CoverLetterWhereUniqueInput | CoverLetterWhereUniqueInput[]
    update?: CoverLetterUpdateWithWhereUniqueWithoutBaseResumeInput | CoverLetterUpdateWithWhereUniqueWithoutBaseResumeInput[]
    updateMany?: CoverLetterUpdateManyWithWhereWithoutBaseResumeInput | CoverLetterUpdateManyWithWhereWithoutBaseResumeInput[]
    deleteMany?: CoverLetterScalarWhereInput | CoverLetterScalarWhereInput[]
  }

  export type TailoredResumeUncheckedUpdateManyWithoutBaseResumeNestedInput = {
    create?: XOR<TailoredResumeCreateWithoutBaseResumeInput, TailoredResumeUncheckedCreateWithoutBaseResumeInput> | TailoredResumeCreateWithoutBaseResumeInput[] | TailoredResumeUncheckedCreateWithoutBaseResumeInput[]
    connectOrCreate?: TailoredResumeCreateOrConnectWithoutBaseResumeInput | TailoredResumeCreateOrConnectWithoutBaseResumeInput[]
    upsert?: TailoredResumeUpsertWithWhereUniqueWithoutBaseResumeInput | TailoredResumeUpsertWithWhereUniqueWithoutBaseResumeInput[]
    createMany?: TailoredResumeCreateManyBaseResumeInputEnvelope
    set?: TailoredResumeWhereUniqueInput | TailoredResumeWhereUniqueInput[]
    disconnect?: TailoredResumeWhereUniqueInput | TailoredResumeWhereUniqueInput[]
    delete?: TailoredResumeWhereUniqueInput | TailoredResumeWhereUniqueInput[]
    connect?: TailoredResumeWhereUniqueInput | TailoredResumeWhereUniqueInput[]
    update?: TailoredResumeUpdateWithWhereUniqueWithoutBaseResumeInput | TailoredResumeUpdateWithWhereUniqueWithoutBaseResumeInput[]
    updateMany?: TailoredResumeUpdateManyWithWhereWithoutBaseResumeInput | TailoredResumeUpdateManyWithWhereWithoutBaseResumeInput[]
    deleteMany?: TailoredResumeScalarWhereInput | TailoredResumeScalarWhereInput[]
  }

  export type CoverLetterUncheckedUpdateManyWithoutBaseResumeNestedInput = {
    create?: XOR<CoverLetterCreateWithoutBaseResumeInput, CoverLetterUncheckedCreateWithoutBaseResumeInput> | CoverLetterCreateWithoutBaseResumeInput[] | CoverLetterUncheckedCreateWithoutBaseResumeInput[]
    connectOrCreate?: CoverLetterCreateOrConnectWithoutBaseResumeInput | CoverLetterCreateOrConnectWithoutBaseResumeInput[]
    upsert?: CoverLetterUpsertWithWhereUniqueWithoutBaseResumeInput | CoverLetterUpsertWithWhereUniqueWithoutBaseResumeInput[]
    createMany?: CoverLetterCreateManyBaseResumeInputEnvelope
    set?: CoverLetterWhereUniqueInput | CoverLetterWhereUniqueInput[]
    disconnect?: CoverLetterWhereUniqueInput | CoverLetterWhereUniqueInput[]
    delete?: CoverLetterWhereUniqueInput | CoverLetterWhereUniqueInput[]
    connect?: CoverLetterWhereUniqueInput | CoverLetterWhereUniqueInput[]
    update?: CoverLetterUpdateWithWhereUniqueWithoutBaseResumeInput | CoverLetterUpdateWithWhereUniqueWithoutBaseResumeInput[]
    updateMany?: CoverLetterUpdateManyWithWhereWithoutBaseResumeInput | CoverLetterUpdateManyWithWhereWithoutBaseResumeInput[]
    deleteMany?: CoverLetterScalarWhereInput | CoverLetterScalarWhereInput[]
  }

  export type UserCreateNestedOneWithoutJobApplicationsInput = {
    create?: XOR<UserCreateWithoutJobApplicationsInput, UserUncheckedCreateWithoutJobApplicationsInput>
    connectOrCreate?: UserCreateOrConnectWithoutJobApplicationsInput
    connect?: UserWhereUniqueInput
  }

  export type JobDescriptionCreateNestedOneWithoutJobApplicationInput = {
    create?: XOR<JobDescriptionCreateWithoutJobApplicationInput, JobDescriptionUncheckedCreateWithoutJobApplicationInput>
    connectOrCreate?: JobDescriptionCreateOrConnectWithoutJobApplicationInput
    connect?: JobDescriptionWhereUniqueInput
  }

  export type TailoredResumeCreateNestedManyWithoutJobApplicationInput = {
    create?: XOR<TailoredResumeCreateWithoutJobApplicationInput, TailoredResumeUncheckedCreateWithoutJobApplicationInput> | TailoredResumeCreateWithoutJobApplicationInput[] | TailoredResumeUncheckedCreateWithoutJobApplicationInput[]
    connectOrCreate?: TailoredResumeCreateOrConnectWithoutJobApplicationInput | TailoredResumeCreateOrConnectWithoutJobApplicationInput[]
    createMany?: TailoredResumeCreateManyJobApplicationInputEnvelope
    connect?: TailoredResumeWhereUniqueInput | TailoredResumeWhereUniqueInput[]
  }

  export type CoverLetterCreateNestedManyWithoutJobApplicationInput = {
    create?: XOR<CoverLetterCreateWithoutJobApplicationInput, CoverLetterUncheckedCreateWithoutJobApplicationInput> | CoverLetterCreateWithoutJobApplicationInput[] | CoverLetterUncheckedCreateWithoutJobApplicationInput[]
    connectOrCreate?: CoverLetterCreateOrConnectWithoutJobApplicationInput | CoverLetterCreateOrConnectWithoutJobApplicationInput[]
    createMany?: CoverLetterCreateManyJobApplicationInputEnvelope
    connect?: CoverLetterWhereUniqueInput | CoverLetterWhereUniqueInput[]
  }

  export type JobDescriptionUncheckedCreateNestedOneWithoutJobApplicationInput = {
    create?: XOR<JobDescriptionCreateWithoutJobApplicationInput, JobDescriptionUncheckedCreateWithoutJobApplicationInput>
    connectOrCreate?: JobDescriptionCreateOrConnectWithoutJobApplicationInput
    connect?: JobDescriptionWhereUniqueInput
  }

  export type TailoredResumeUncheckedCreateNestedManyWithoutJobApplicationInput = {
    create?: XOR<TailoredResumeCreateWithoutJobApplicationInput, TailoredResumeUncheckedCreateWithoutJobApplicationInput> | TailoredResumeCreateWithoutJobApplicationInput[] | TailoredResumeUncheckedCreateWithoutJobApplicationInput[]
    connectOrCreate?: TailoredResumeCreateOrConnectWithoutJobApplicationInput | TailoredResumeCreateOrConnectWithoutJobApplicationInput[]
    createMany?: TailoredResumeCreateManyJobApplicationInputEnvelope
    connect?: TailoredResumeWhereUniqueInput | TailoredResumeWhereUniqueInput[]
  }

  export type CoverLetterUncheckedCreateNestedManyWithoutJobApplicationInput = {
    create?: XOR<CoverLetterCreateWithoutJobApplicationInput, CoverLetterUncheckedCreateWithoutJobApplicationInput> | CoverLetterCreateWithoutJobApplicationInput[] | CoverLetterUncheckedCreateWithoutJobApplicationInput[]
    connectOrCreate?: CoverLetterCreateOrConnectWithoutJobApplicationInput | CoverLetterCreateOrConnectWithoutJobApplicationInput[]
    createMany?: CoverLetterCreateManyJobApplicationInputEnvelope
    connect?: CoverLetterWhereUniqueInput | CoverLetterWhereUniqueInput[]
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type EnumJobTypeFieldUpdateOperationsInput = {
    set?: $Enums.JobType
  }

  export type NullableFloatFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type EnumApplicationStatusFieldUpdateOperationsInput = {
    set?: $Enums.ApplicationStatus
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type UserUpdateOneRequiredWithoutJobApplicationsNestedInput = {
    create?: XOR<UserCreateWithoutJobApplicationsInput, UserUncheckedCreateWithoutJobApplicationsInput>
    connectOrCreate?: UserCreateOrConnectWithoutJobApplicationsInput
    upsert?: UserUpsertWithoutJobApplicationsInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutJobApplicationsInput, UserUpdateWithoutJobApplicationsInput>, UserUncheckedUpdateWithoutJobApplicationsInput>
  }

  export type JobDescriptionUpdateOneWithoutJobApplicationNestedInput = {
    create?: XOR<JobDescriptionCreateWithoutJobApplicationInput, JobDescriptionUncheckedCreateWithoutJobApplicationInput>
    connectOrCreate?: JobDescriptionCreateOrConnectWithoutJobApplicationInput
    upsert?: JobDescriptionUpsertWithoutJobApplicationInput
    disconnect?: JobDescriptionWhereInput | boolean
    delete?: JobDescriptionWhereInput | boolean
    connect?: JobDescriptionWhereUniqueInput
    update?: XOR<XOR<JobDescriptionUpdateToOneWithWhereWithoutJobApplicationInput, JobDescriptionUpdateWithoutJobApplicationInput>, JobDescriptionUncheckedUpdateWithoutJobApplicationInput>
  }

  export type TailoredResumeUpdateManyWithoutJobApplicationNestedInput = {
    create?: XOR<TailoredResumeCreateWithoutJobApplicationInput, TailoredResumeUncheckedCreateWithoutJobApplicationInput> | TailoredResumeCreateWithoutJobApplicationInput[] | TailoredResumeUncheckedCreateWithoutJobApplicationInput[]
    connectOrCreate?: TailoredResumeCreateOrConnectWithoutJobApplicationInput | TailoredResumeCreateOrConnectWithoutJobApplicationInput[]
    upsert?: TailoredResumeUpsertWithWhereUniqueWithoutJobApplicationInput | TailoredResumeUpsertWithWhereUniqueWithoutJobApplicationInput[]
    createMany?: TailoredResumeCreateManyJobApplicationInputEnvelope
    set?: TailoredResumeWhereUniqueInput | TailoredResumeWhereUniqueInput[]
    disconnect?: TailoredResumeWhereUniqueInput | TailoredResumeWhereUniqueInput[]
    delete?: TailoredResumeWhereUniqueInput | TailoredResumeWhereUniqueInput[]
    connect?: TailoredResumeWhereUniqueInput | TailoredResumeWhereUniqueInput[]
    update?: TailoredResumeUpdateWithWhereUniqueWithoutJobApplicationInput | TailoredResumeUpdateWithWhereUniqueWithoutJobApplicationInput[]
    updateMany?: TailoredResumeUpdateManyWithWhereWithoutJobApplicationInput | TailoredResumeUpdateManyWithWhereWithoutJobApplicationInput[]
    deleteMany?: TailoredResumeScalarWhereInput | TailoredResumeScalarWhereInput[]
  }

  export type CoverLetterUpdateManyWithoutJobApplicationNestedInput = {
    create?: XOR<CoverLetterCreateWithoutJobApplicationInput, CoverLetterUncheckedCreateWithoutJobApplicationInput> | CoverLetterCreateWithoutJobApplicationInput[] | CoverLetterUncheckedCreateWithoutJobApplicationInput[]
    connectOrCreate?: CoverLetterCreateOrConnectWithoutJobApplicationInput | CoverLetterCreateOrConnectWithoutJobApplicationInput[]
    upsert?: CoverLetterUpsertWithWhereUniqueWithoutJobApplicationInput | CoverLetterUpsertWithWhereUniqueWithoutJobApplicationInput[]
    createMany?: CoverLetterCreateManyJobApplicationInputEnvelope
    set?: CoverLetterWhereUniqueInput | CoverLetterWhereUniqueInput[]
    disconnect?: CoverLetterWhereUniqueInput | CoverLetterWhereUniqueInput[]
    delete?: CoverLetterWhereUniqueInput | CoverLetterWhereUniqueInput[]
    connect?: CoverLetterWhereUniqueInput | CoverLetterWhereUniqueInput[]
    update?: CoverLetterUpdateWithWhereUniqueWithoutJobApplicationInput | CoverLetterUpdateWithWhereUniqueWithoutJobApplicationInput[]
    updateMany?: CoverLetterUpdateManyWithWhereWithoutJobApplicationInput | CoverLetterUpdateManyWithWhereWithoutJobApplicationInput[]
    deleteMany?: CoverLetterScalarWhereInput | CoverLetterScalarWhereInput[]
  }

  export type JobDescriptionUncheckedUpdateOneWithoutJobApplicationNestedInput = {
    create?: XOR<JobDescriptionCreateWithoutJobApplicationInput, JobDescriptionUncheckedCreateWithoutJobApplicationInput>
    connectOrCreate?: JobDescriptionCreateOrConnectWithoutJobApplicationInput
    upsert?: JobDescriptionUpsertWithoutJobApplicationInput
    disconnect?: JobDescriptionWhereInput | boolean
    delete?: JobDescriptionWhereInput | boolean
    connect?: JobDescriptionWhereUniqueInput
    update?: XOR<XOR<JobDescriptionUpdateToOneWithWhereWithoutJobApplicationInput, JobDescriptionUpdateWithoutJobApplicationInput>, JobDescriptionUncheckedUpdateWithoutJobApplicationInput>
  }

  export type TailoredResumeUncheckedUpdateManyWithoutJobApplicationNestedInput = {
    create?: XOR<TailoredResumeCreateWithoutJobApplicationInput, TailoredResumeUncheckedCreateWithoutJobApplicationInput> | TailoredResumeCreateWithoutJobApplicationInput[] | TailoredResumeUncheckedCreateWithoutJobApplicationInput[]
    connectOrCreate?: TailoredResumeCreateOrConnectWithoutJobApplicationInput | TailoredResumeCreateOrConnectWithoutJobApplicationInput[]
    upsert?: TailoredResumeUpsertWithWhereUniqueWithoutJobApplicationInput | TailoredResumeUpsertWithWhereUniqueWithoutJobApplicationInput[]
    createMany?: TailoredResumeCreateManyJobApplicationInputEnvelope
    set?: TailoredResumeWhereUniqueInput | TailoredResumeWhereUniqueInput[]
    disconnect?: TailoredResumeWhereUniqueInput | TailoredResumeWhereUniqueInput[]
    delete?: TailoredResumeWhereUniqueInput | TailoredResumeWhereUniqueInput[]
    connect?: TailoredResumeWhereUniqueInput | TailoredResumeWhereUniqueInput[]
    update?: TailoredResumeUpdateWithWhereUniqueWithoutJobApplicationInput | TailoredResumeUpdateWithWhereUniqueWithoutJobApplicationInput[]
    updateMany?: TailoredResumeUpdateManyWithWhereWithoutJobApplicationInput | TailoredResumeUpdateManyWithWhereWithoutJobApplicationInput[]
    deleteMany?: TailoredResumeScalarWhereInput | TailoredResumeScalarWhereInput[]
  }

  export type CoverLetterUncheckedUpdateManyWithoutJobApplicationNestedInput = {
    create?: XOR<CoverLetterCreateWithoutJobApplicationInput, CoverLetterUncheckedCreateWithoutJobApplicationInput> | CoverLetterCreateWithoutJobApplicationInput[] | CoverLetterUncheckedCreateWithoutJobApplicationInput[]
    connectOrCreate?: CoverLetterCreateOrConnectWithoutJobApplicationInput | CoverLetterCreateOrConnectWithoutJobApplicationInput[]
    upsert?: CoverLetterUpsertWithWhereUniqueWithoutJobApplicationInput | CoverLetterUpsertWithWhereUniqueWithoutJobApplicationInput[]
    createMany?: CoverLetterCreateManyJobApplicationInputEnvelope
    set?: CoverLetterWhereUniqueInput | CoverLetterWhereUniqueInput[]
    disconnect?: CoverLetterWhereUniqueInput | CoverLetterWhereUniqueInput[]
    delete?: CoverLetterWhereUniqueInput | CoverLetterWhereUniqueInput[]
    connect?: CoverLetterWhereUniqueInput | CoverLetterWhereUniqueInput[]
    update?: CoverLetterUpdateWithWhereUniqueWithoutJobApplicationInput | CoverLetterUpdateWithWhereUniqueWithoutJobApplicationInput[]
    updateMany?: CoverLetterUpdateManyWithWhereWithoutJobApplicationInput | CoverLetterUpdateManyWithWhereWithoutJobApplicationInput[]
    deleteMany?: CoverLetterScalarWhereInput | CoverLetterScalarWhereInput[]
  }

  export type JobApplicationCreateNestedOneWithoutJobDescriptionInput = {
    create?: XOR<JobApplicationCreateWithoutJobDescriptionInput, JobApplicationUncheckedCreateWithoutJobDescriptionInput>
    connectOrCreate?: JobApplicationCreateOrConnectWithoutJobDescriptionInput
    connect?: JobApplicationWhereUniqueInput
  }

  export type JobApplicationUpdateOneRequiredWithoutJobDescriptionNestedInput = {
    create?: XOR<JobApplicationCreateWithoutJobDescriptionInput, JobApplicationUncheckedCreateWithoutJobDescriptionInput>
    connectOrCreate?: JobApplicationCreateOrConnectWithoutJobDescriptionInput
    upsert?: JobApplicationUpsertWithoutJobDescriptionInput
    connect?: JobApplicationWhereUniqueInput
    update?: XOR<XOR<JobApplicationUpdateToOneWithWhereWithoutJobDescriptionInput, JobApplicationUpdateWithoutJobDescriptionInput>, JobApplicationUncheckedUpdateWithoutJobDescriptionInput>
  }

  export type JobApplicationCreateNestedOneWithoutTailoredResumesInput = {
    create?: XOR<JobApplicationCreateWithoutTailoredResumesInput, JobApplicationUncheckedCreateWithoutTailoredResumesInput>
    connectOrCreate?: JobApplicationCreateOrConnectWithoutTailoredResumesInput
    connect?: JobApplicationWhereUniqueInput
  }

  export type ResumeCreateNestedOneWithoutTailoredResumesInput = {
    create?: XOR<ResumeCreateWithoutTailoredResumesInput, ResumeUncheckedCreateWithoutTailoredResumesInput>
    connectOrCreate?: ResumeCreateOrConnectWithoutTailoredResumesInput
    connect?: ResumeWhereUniqueInput
  }

  export type JobApplicationUpdateOneRequiredWithoutTailoredResumesNestedInput = {
    create?: XOR<JobApplicationCreateWithoutTailoredResumesInput, JobApplicationUncheckedCreateWithoutTailoredResumesInput>
    connectOrCreate?: JobApplicationCreateOrConnectWithoutTailoredResumesInput
    upsert?: JobApplicationUpsertWithoutTailoredResumesInput
    connect?: JobApplicationWhereUniqueInput
    update?: XOR<XOR<JobApplicationUpdateToOneWithWhereWithoutTailoredResumesInput, JobApplicationUpdateWithoutTailoredResumesInput>, JobApplicationUncheckedUpdateWithoutTailoredResumesInput>
  }

  export type ResumeUpdateOneRequiredWithoutTailoredResumesNestedInput = {
    create?: XOR<ResumeCreateWithoutTailoredResumesInput, ResumeUncheckedCreateWithoutTailoredResumesInput>
    connectOrCreate?: ResumeCreateOrConnectWithoutTailoredResumesInput
    upsert?: ResumeUpsertWithoutTailoredResumesInput
    connect?: ResumeWhereUniqueInput
    update?: XOR<XOR<ResumeUpdateToOneWithWhereWithoutTailoredResumesInput, ResumeUpdateWithoutTailoredResumesInput>, ResumeUncheckedUpdateWithoutTailoredResumesInput>
  }

  export type JobApplicationCreateNestedOneWithoutCoverLettersInput = {
    create?: XOR<JobApplicationCreateWithoutCoverLettersInput, JobApplicationUncheckedCreateWithoutCoverLettersInput>
    connectOrCreate?: JobApplicationCreateOrConnectWithoutCoverLettersInput
    connect?: JobApplicationWhereUniqueInput
  }

  export type ResumeCreateNestedOneWithoutCoverLettersInput = {
    create?: XOR<ResumeCreateWithoutCoverLettersInput, ResumeUncheckedCreateWithoutCoverLettersInput>
    connectOrCreate?: ResumeCreateOrConnectWithoutCoverLettersInput
    connect?: ResumeWhereUniqueInput
  }

  export type JobApplicationUpdateOneRequiredWithoutCoverLettersNestedInput = {
    create?: XOR<JobApplicationCreateWithoutCoverLettersInput, JobApplicationUncheckedCreateWithoutCoverLettersInput>
    connectOrCreate?: JobApplicationCreateOrConnectWithoutCoverLettersInput
    upsert?: JobApplicationUpsertWithoutCoverLettersInput
    connect?: JobApplicationWhereUniqueInput
    update?: XOR<XOR<JobApplicationUpdateToOneWithWhereWithoutCoverLettersInput, JobApplicationUpdateWithoutCoverLettersInput>, JobApplicationUncheckedUpdateWithoutCoverLettersInput>
  }

  export type ResumeUpdateOneWithoutCoverLettersNestedInput = {
    create?: XOR<ResumeCreateWithoutCoverLettersInput, ResumeUncheckedCreateWithoutCoverLettersInput>
    connectOrCreate?: ResumeCreateOrConnectWithoutCoverLettersInput
    upsert?: ResumeUpsertWithoutCoverLettersInput
    disconnect?: ResumeWhereInput | boolean
    delete?: ResumeWhereInput | boolean
    connect?: ResumeWhereUniqueInput
    update?: XOR<XOR<ResumeUpdateToOneWithWhereWithoutCoverLettersInput, ResumeUpdateWithoutCoverLettersInput>, ResumeUncheckedUpdateWithoutCoverLettersInput>
  }

  export type NullableIntFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type EnumSkipRuleTypeFieldUpdateOperationsInput = {
    set?: $Enums.SkipRuleType
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedDateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type NestedDateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedEnumJobTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.JobType | EnumJobTypeFieldRefInput<$PrismaModel>
    in?: $Enums.JobType[] | ListEnumJobTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.JobType[] | ListEnumJobTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumJobTypeFilter<$PrismaModel> | $Enums.JobType
  }

  export type NestedFloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type NestedEnumApplicationStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.ApplicationStatus | EnumApplicationStatusFieldRefInput<$PrismaModel>
    in?: $Enums.ApplicationStatus[] | ListEnumApplicationStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.ApplicationStatus[] | ListEnumApplicationStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumApplicationStatusFilter<$PrismaModel> | $Enums.ApplicationStatus
  }

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedEnumJobTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.JobType | EnumJobTypeFieldRefInput<$PrismaModel>
    in?: $Enums.JobType[] | ListEnumJobTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.JobType[] | ListEnumJobTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumJobTypeWithAggregatesFilter<$PrismaModel> | $Enums.JobType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumJobTypeFilter<$PrismaModel>
    _max?: NestedEnumJobTypeFilter<$PrismaModel>
  }

  export type NestedFloatNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedFloatNullableFilter<$PrismaModel>
    _min?: NestedFloatNullableFilter<$PrismaModel>
    _max?: NestedFloatNullableFilter<$PrismaModel>
  }

  export type NestedEnumApplicationStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.ApplicationStatus | EnumApplicationStatusFieldRefInput<$PrismaModel>
    in?: $Enums.ApplicationStatus[] | ListEnumApplicationStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.ApplicationStatus[] | ListEnumApplicationStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumApplicationStatusWithAggregatesFilter<$PrismaModel> | $Enums.ApplicationStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumApplicationStatusFilter<$PrismaModel>
    _max?: NestedEnumApplicationStatusFilter<$PrismaModel>
  }

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type NestedIntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type NestedEnumSkipRuleTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.SkipRuleType | EnumSkipRuleTypeFieldRefInput<$PrismaModel>
    in?: $Enums.SkipRuleType[] | ListEnumSkipRuleTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.SkipRuleType[] | ListEnumSkipRuleTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumSkipRuleTypeFilter<$PrismaModel> | $Enums.SkipRuleType
  }

  export type NestedEnumSkipRuleTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.SkipRuleType | EnumSkipRuleTypeFieldRefInput<$PrismaModel>
    in?: $Enums.SkipRuleType[] | ListEnumSkipRuleTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.SkipRuleType[] | ListEnumSkipRuleTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumSkipRuleTypeWithAggregatesFilter<$PrismaModel> | $Enums.SkipRuleType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumSkipRuleTypeFilter<$PrismaModel>
    _max?: NestedEnumSkipRuleTypeFilter<$PrismaModel>
  }

  export type ResumeCreateWithoutUserInput = {
    name: string
    rawText: string
    createdAt?: Date | string
    updatedAt?: Date | string
    tailoredResumes?: TailoredResumeCreateNestedManyWithoutBaseResumeInput
    coverLetters?: CoverLetterCreateNestedManyWithoutBaseResumeInput
  }

  export type ResumeUncheckedCreateWithoutUserInput = {
    id?: number
    name: string
    rawText: string
    createdAt?: Date | string
    updatedAt?: Date | string
    tailoredResumes?: TailoredResumeUncheckedCreateNestedManyWithoutBaseResumeInput
    coverLetters?: CoverLetterUncheckedCreateNestedManyWithoutBaseResumeInput
  }

  export type ResumeCreateOrConnectWithoutUserInput = {
    where: ResumeWhereUniqueInput
    create: XOR<ResumeCreateWithoutUserInput, ResumeUncheckedCreateWithoutUserInput>
  }

  export type ResumeCreateManyUserInputEnvelope = {
    data: ResumeCreateManyUserInput | ResumeCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type JobApplicationCreateWithoutUserInput = {
    source?: string
    jobrightJobId?: string | null
    title: string
    company: string
    location?: string | null
    jobType?: $Enums.JobType
    jobrightMatchScore?: number | null
    jobrightBoard?: string | null
    jobrightUrl?: string | null
    externalUrl: string
    status?: $Enums.ApplicationStatus
    invitedToInterview?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    appliedAt?: Date | string | null
    jobDescription?: JobDescriptionCreateNestedOneWithoutJobApplicationInput
    tailoredResumes?: TailoredResumeCreateNestedManyWithoutJobApplicationInput
    coverLetters?: CoverLetterCreateNestedManyWithoutJobApplicationInput
  }

  export type JobApplicationUncheckedCreateWithoutUserInput = {
    id?: number
    source?: string
    jobrightJobId?: string | null
    title: string
    company: string
    location?: string | null
    jobType?: $Enums.JobType
    jobrightMatchScore?: number | null
    jobrightBoard?: string | null
    jobrightUrl?: string | null
    externalUrl: string
    status?: $Enums.ApplicationStatus
    invitedToInterview?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    appliedAt?: Date | string | null
    jobDescription?: JobDescriptionUncheckedCreateNestedOneWithoutJobApplicationInput
    tailoredResumes?: TailoredResumeUncheckedCreateNestedManyWithoutJobApplicationInput
    coverLetters?: CoverLetterUncheckedCreateNestedManyWithoutJobApplicationInput
  }

  export type JobApplicationCreateOrConnectWithoutUserInput = {
    where: JobApplicationWhereUniqueInput
    create: XOR<JobApplicationCreateWithoutUserInput, JobApplicationUncheckedCreateWithoutUserInput>
  }

  export type JobApplicationCreateManyUserInputEnvelope = {
    data: JobApplicationCreateManyUserInput | JobApplicationCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type OneClickJobCreateWithoutUserInput = {
    source: string
    title: string
    company: string
    externalUrl: string
    fullText: string
    appliedAt?: Date | string | null
    createdAt?: Date | string
  }

  export type OneClickJobUncheckedCreateWithoutUserInput = {
    id?: number
    source: string
    title: string
    company: string
    externalUrl: string
    fullText: string
    appliedAt?: Date | string | null
    createdAt?: Date | string
  }

  export type OneClickJobCreateOrConnectWithoutUserInput = {
    where: OneClickJobWhereUniqueInput
    create: XOR<OneClickJobCreateWithoutUserInput, OneClickJobUncheckedCreateWithoutUserInput>
  }

  export type OneClickJobCreateManyUserInputEnvelope = {
    data: OneClickJobCreateManyUserInput | OneClickJobCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type ResumeUpsertWithWhereUniqueWithoutUserInput = {
    where: ResumeWhereUniqueInput
    update: XOR<ResumeUpdateWithoutUserInput, ResumeUncheckedUpdateWithoutUserInput>
    create: XOR<ResumeCreateWithoutUserInput, ResumeUncheckedCreateWithoutUserInput>
  }

  export type ResumeUpdateWithWhereUniqueWithoutUserInput = {
    where: ResumeWhereUniqueInput
    data: XOR<ResumeUpdateWithoutUserInput, ResumeUncheckedUpdateWithoutUserInput>
  }

  export type ResumeUpdateManyWithWhereWithoutUserInput = {
    where: ResumeScalarWhereInput
    data: XOR<ResumeUpdateManyMutationInput, ResumeUncheckedUpdateManyWithoutUserInput>
  }

  export type ResumeScalarWhereInput = {
    AND?: ResumeScalarWhereInput | ResumeScalarWhereInput[]
    OR?: ResumeScalarWhereInput[]
    NOT?: ResumeScalarWhereInput | ResumeScalarWhereInput[]
    id?: IntFilter<"Resume"> | number
    userId?: IntFilter<"Resume"> | number
    name?: StringFilter<"Resume"> | string
    rawText?: StringFilter<"Resume"> | string
    createdAt?: DateTimeFilter<"Resume"> | Date | string
    updatedAt?: DateTimeFilter<"Resume"> | Date | string
  }

  export type JobApplicationUpsertWithWhereUniqueWithoutUserInput = {
    where: JobApplicationWhereUniqueInput
    update: XOR<JobApplicationUpdateWithoutUserInput, JobApplicationUncheckedUpdateWithoutUserInput>
    create: XOR<JobApplicationCreateWithoutUserInput, JobApplicationUncheckedCreateWithoutUserInput>
  }

  export type JobApplicationUpdateWithWhereUniqueWithoutUserInput = {
    where: JobApplicationWhereUniqueInput
    data: XOR<JobApplicationUpdateWithoutUserInput, JobApplicationUncheckedUpdateWithoutUserInput>
  }

  export type JobApplicationUpdateManyWithWhereWithoutUserInput = {
    where: JobApplicationScalarWhereInput
    data: XOR<JobApplicationUpdateManyMutationInput, JobApplicationUncheckedUpdateManyWithoutUserInput>
  }

  export type JobApplicationScalarWhereInput = {
    AND?: JobApplicationScalarWhereInput | JobApplicationScalarWhereInput[]
    OR?: JobApplicationScalarWhereInput[]
    NOT?: JobApplicationScalarWhereInput | JobApplicationScalarWhereInput[]
    id?: IntFilter<"JobApplication"> | number
    userId?: IntFilter<"JobApplication"> | number
    source?: StringFilter<"JobApplication"> | string
    jobrightJobId?: StringNullableFilter<"JobApplication"> | string | null
    title?: StringFilter<"JobApplication"> | string
    company?: StringFilter<"JobApplication"> | string
    location?: StringNullableFilter<"JobApplication"> | string | null
    jobType?: EnumJobTypeFilter<"JobApplication"> | $Enums.JobType
    jobrightMatchScore?: FloatNullableFilter<"JobApplication"> | number | null
    jobrightBoard?: StringNullableFilter<"JobApplication"> | string | null
    jobrightUrl?: StringNullableFilter<"JobApplication"> | string | null
    externalUrl?: StringFilter<"JobApplication"> | string
    status?: EnumApplicationStatusFilter<"JobApplication"> | $Enums.ApplicationStatus
    invitedToInterview?: BoolFilter<"JobApplication"> | boolean
    createdAt?: DateTimeFilter<"JobApplication"> | Date | string
    updatedAt?: DateTimeFilter<"JobApplication"> | Date | string
    appliedAt?: DateTimeNullableFilter<"JobApplication"> | Date | string | null
  }

  export type OneClickJobUpsertWithWhereUniqueWithoutUserInput = {
    where: OneClickJobWhereUniqueInput
    update: XOR<OneClickJobUpdateWithoutUserInput, OneClickJobUncheckedUpdateWithoutUserInput>
    create: XOR<OneClickJobCreateWithoutUserInput, OneClickJobUncheckedCreateWithoutUserInput>
  }

  export type OneClickJobUpdateWithWhereUniqueWithoutUserInput = {
    where: OneClickJobWhereUniqueInput
    data: XOR<OneClickJobUpdateWithoutUserInput, OneClickJobUncheckedUpdateWithoutUserInput>
  }

  export type OneClickJobUpdateManyWithWhereWithoutUserInput = {
    where: OneClickJobScalarWhereInput
    data: XOR<OneClickJobUpdateManyMutationInput, OneClickJobUncheckedUpdateManyWithoutUserInput>
  }

  export type OneClickJobScalarWhereInput = {
    AND?: OneClickJobScalarWhereInput | OneClickJobScalarWhereInput[]
    OR?: OneClickJobScalarWhereInput[]
    NOT?: OneClickJobScalarWhereInput | OneClickJobScalarWhereInput[]
    id?: IntFilter<"OneClickJob"> | number
    userId?: IntFilter<"OneClickJob"> | number
    source?: StringFilter<"OneClickJob"> | string
    title?: StringFilter<"OneClickJob"> | string
    company?: StringFilter<"OneClickJob"> | string
    externalUrl?: StringFilter<"OneClickJob"> | string
    fullText?: StringFilter<"OneClickJob"> | string
    appliedAt?: DateTimeNullableFilter<"OneClickJob"> | Date | string | null
    createdAt?: DateTimeFilter<"OneClickJob"> | Date | string
  }

  export type UserCreateWithoutOneClickJobsInput = {
    email: string
    passwordHash: string
    createdAt?: Date | string
    resumes?: ResumeCreateNestedManyWithoutUserInput
    jobApplications?: JobApplicationCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutOneClickJobsInput = {
    id?: number
    email: string
    passwordHash: string
    createdAt?: Date | string
    resumes?: ResumeUncheckedCreateNestedManyWithoutUserInput
    jobApplications?: JobApplicationUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutOneClickJobsInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutOneClickJobsInput, UserUncheckedCreateWithoutOneClickJobsInput>
  }

  export type UserUpsertWithoutOneClickJobsInput = {
    update: XOR<UserUpdateWithoutOneClickJobsInput, UserUncheckedUpdateWithoutOneClickJobsInput>
    create: XOR<UserCreateWithoutOneClickJobsInput, UserUncheckedCreateWithoutOneClickJobsInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutOneClickJobsInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutOneClickJobsInput, UserUncheckedUpdateWithoutOneClickJobsInput>
  }

  export type UserUpdateWithoutOneClickJobsInput = {
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    resumes?: ResumeUpdateManyWithoutUserNestedInput
    jobApplications?: JobApplicationUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutOneClickJobsInput = {
    id?: IntFieldUpdateOperationsInput | number
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    resumes?: ResumeUncheckedUpdateManyWithoutUserNestedInput
    jobApplications?: JobApplicationUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserCreateWithoutResumesInput = {
    email: string
    passwordHash: string
    createdAt?: Date | string
    jobApplications?: JobApplicationCreateNestedManyWithoutUserInput
    oneClickJobs?: OneClickJobCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutResumesInput = {
    id?: number
    email: string
    passwordHash: string
    createdAt?: Date | string
    jobApplications?: JobApplicationUncheckedCreateNestedManyWithoutUserInput
    oneClickJobs?: OneClickJobUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutResumesInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutResumesInput, UserUncheckedCreateWithoutResumesInput>
  }

  export type TailoredResumeCreateWithoutBaseResumeInput = {
    llmModel: string
    promptVersion: string
    outputText: string
    createdAt?: Date | string
    jobApplication: JobApplicationCreateNestedOneWithoutTailoredResumesInput
  }

  export type TailoredResumeUncheckedCreateWithoutBaseResumeInput = {
    id?: number
    jobApplicationId: number
    llmModel: string
    promptVersion: string
    outputText: string
    createdAt?: Date | string
  }

  export type TailoredResumeCreateOrConnectWithoutBaseResumeInput = {
    where: TailoredResumeWhereUniqueInput
    create: XOR<TailoredResumeCreateWithoutBaseResumeInput, TailoredResumeUncheckedCreateWithoutBaseResumeInput>
  }

  export type TailoredResumeCreateManyBaseResumeInputEnvelope = {
    data: TailoredResumeCreateManyBaseResumeInput | TailoredResumeCreateManyBaseResumeInput[]
    skipDuplicates?: boolean
  }

  export type CoverLetterCreateWithoutBaseResumeInput = {
    llmModel: string
    promptVersion: string
    outputText: string
    createdAt?: Date | string
    jobApplication: JobApplicationCreateNestedOneWithoutCoverLettersInput
  }

  export type CoverLetterUncheckedCreateWithoutBaseResumeInput = {
    id?: number
    jobApplicationId: number
    llmModel: string
    promptVersion: string
    outputText: string
    createdAt?: Date | string
  }

  export type CoverLetterCreateOrConnectWithoutBaseResumeInput = {
    where: CoverLetterWhereUniqueInput
    create: XOR<CoverLetterCreateWithoutBaseResumeInput, CoverLetterUncheckedCreateWithoutBaseResumeInput>
  }

  export type CoverLetterCreateManyBaseResumeInputEnvelope = {
    data: CoverLetterCreateManyBaseResumeInput | CoverLetterCreateManyBaseResumeInput[]
    skipDuplicates?: boolean
  }

  export type UserUpsertWithoutResumesInput = {
    update: XOR<UserUpdateWithoutResumesInput, UserUncheckedUpdateWithoutResumesInput>
    create: XOR<UserCreateWithoutResumesInput, UserUncheckedCreateWithoutResumesInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutResumesInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutResumesInput, UserUncheckedUpdateWithoutResumesInput>
  }

  export type UserUpdateWithoutResumesInput = {
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    jobApplications?: JobApplicationUpdateManyWithoutUserNestedInput
    oneClickJobs?: OneClickJobUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutResumesInput = {
    id?: IntFieldUpdateOperationsInput | number
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    jobApplications?: JobApplicationUncheckedUpdateManyWithoutUserNestedInput
    oneClickJobs?: OneClickJobUncheckedUpdateManyWithoutUserNestedInput
  }

  export type TailoredResumeUpsertWithWhereUniqueWithoutBaseResumeInput = {
    where: TailoredResumeWhereUniqueInput
    update: XOR<TailoredResumeUpdateWithoutBaseResumeInput, TailoredResumeUncheckedUpdateWithoutBaseResumeInput>
    create: XOR<TailoredResumeCreateWithoutBaseResumeInput, TailoredResumeUncheckedCreateWithoutBaseResumeInput>
  }

  export type TailoredResumeUpdateWithWhereUniqueWithoutBaseResumeInput = {
    where: TailoredResumeWhereUniqueInput
    data: XOR<TailoredResumeUpdateWithoutBaseResumeInput, TailoredResumeUncheckedUpdateWithoutBaseResumeInput>
  }

  export type TailoredResumeUpdateManyWithWhereWithoutBaseResumeInput = {
    where: TailoredResumeScalarWhereInput
    data: XOR<TailoredResumeUpdateManyMutationInput, TailoredResumeUncheckedUpdateManyWithoutBaseResumeInput>
  }

  export type TailoredResumeScalarWhereInput = {
    AND?: TailoredResumeScalarWhereInput | TailoredResumeScalarWhereInput[]
    OR?: TailoredResumeScalarWhereInput[]
    NOT?: TailoredResumeScalarWhereInput | TailoredResumeScalarWhereInput[]
    id?: IntFilter<"TailoredResume"> | number
    jobApplicationId?: IntFilter<"TailoredResume"> | number
    baseResumeId?: IntFilter<"TailoredResume"> | number
    llmModel?: StringFilter<"TailoredResume"> | string
    promptVersion?: StringFilter<"TailoredResume"> | string
    outputText?: StringFilter<"TailoredResume"> | string
    createdAt?: DateTimeFilter<"TailoredResume"> | Date | string
  }

  export type CoverLetterUpsertWithWhereUniqueWithoutBaseResumeInput = {
    where: CoverLetterWhereUniqueInput
    update: XOR<CoverLetterUpdateWithoutBaseResumeInput, CoverLetterUncheckedUpdateWithoutBaseResumeInput>
    create: XOR<CoverLetterCreateWithoutBaseResumeInput, CoverLetterUncheckedCreateWithoutBaseResumeInput>
  }

  export type CoverLetterUpdateWithWhereUniqueWithoutBaseResumeInput = {
    where: CoverLetterWhereUniqueInput
    data: XOR<CoverLetterUpdateWithoutBaseResumeInput, CoverLetterUncheckedUpdateWithoutBaseResumeInput>
  }

  export type CoverLetterUpdateManyWithWhereWithoutBaseResumeInput = {
    where: CoverLetterScalarWhereInput
    data: XOR<CoverLetterUpdateManyMutationInput, CoverLetterUncheckedUpdateManyWithoutBaseResumeInput>
  }

  export type CoverLetterScalarWhereInput = {
    AND?: CoverLetterScalarWhereInput | CoverLetterScalarWhereInput[]
    OR?: CoverLetterScalarWhereInput[]
    NOT?: CoverLetterScalarWhereInput | CoverLetterScalarWhereInput[]
    id?: IntFilter<"CoverLetter"> | number
    jobApplicationId?: IntFilter<"CoverLetter"> | number
    baseResumeId?: IntNullableFilter<"CoverLetter"> | number | null
    llmModel?: StringFilter<"CoverLetter"> | string
    promptVersion?: StringFilter<"CoverLetter"> | string
    outputText?: StringFilter<"CoverLetter"> | string
    createdAt?: DateTimeFilter<"CoverLetter"> | Date | string
  }

  export type UserCreateWithoutJobApplicationsInput = {
    email: string
    passwordHash: string
    createdAt?: Date | string
    resumes?: ResumeCreateNestedManyWithoutUserInput
    oneClickJobs?: OneClickJobCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutJobApplicationsInput = {
    id?: number
    email: string
    passwordHash: string
    createdAt?: Date | string
    resumes?: ResumeUncheckedCreateNestedManyWithoutUserInput
    oneClickJobs?: OneClickJobUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutJobApplicationsInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutJobApplicationsInput, UserUncheckedCreateWithoutJobApplicationsInput>
  }

  export type JobDescriptionCreateWithoutJobApplicationInput = {
    fullText: string
    source?: string
    createdAt?: Date | string
  }

  export type JobDescriptionUncheckedCreateWithoutJobApplicationInput = {
    id?: number
    fullText: string
    source?: string
    createdAt?: Date | string
  }

  export type JobDescriptionCreateOrConnectWithoutJobApplicationInput = {
    where: JobDescriptionWhereUniqueInput
    create: XOR<JobDescriptionCreateWithoutJobApplicationInput, JobDescriptionUncheckedCreateWithoutJobApplicationInput>
  }

  export type TailoredResumeCreateWithoutJobApplicationInput = {
    llmModel: string
    promptVersion: string
    outputText: string
    createdAt?: Date | string
    baseResume: ResumeCreateNestedOneWithoutTailoredResumesInput
  }

  export type TailoredResumeUncheckedCreateWithoutJobApplicationInput = {
    id?: number
    baseResumeId: number
    llmModel: string
    promptVersion: string
    outputText: string
    createdAt?: Date | string
  }

  export type TailoredResumeCreateOrConnectWithoutJobApplicationInput = {
    where: TailoredResumeWhereUniqueInput
    create: XOR<TailoredResumeCreateWithoutJobApplicationInput, TailoredResumeUncheckedCreateWithoutJobApplicationInput>
  }

  export type TailoredResumeCreateManyJobApplicationInputEnvelope = {
    data: TailoredResumeCreateManyJobApplicationInput | TailoredResumeCreateManyJobApplicationInput[]
    skipDuplicates?: boolean
  }

  export type CoverLetterCreateWithoutJobApplicationInput = {
    llmModel: string
    promptVersion: string
    outputText: string
    createdAt?: Date | string
    baseResume?: ResumeCreateNestedOneWithoutCoverLettersInput
  }

  export type CoverLetterUncheckedCreateWithoutJobApplicationInput = {
    id?: number
    baseResumeId?: number | null
    llmModel: string
    promptVersion: string
    outputText: string
    createdAt?: Date | string
  }

  export type CoverLetterCreateOrConnectWithoutJobApplicationInput = {
    where: CoverLetterWhereUniqueInput
    create: XOR<CoverLetterCreateWithoutJobApplicationInput, CoverLetterUncheckedCreateWithoutJobApplicationInput>
  }

  export type CoverLetterCreateManyJobApplicationInputEnvelope = {
    data: CoverLetterCreateManyJobApplicationInput | CoverLetterCreateManyJobApplicationInput[]
    skipDuplicates?: boolean
  }

  export type UserUpsertWithoutJobApplicationsInput = {
    update: XOR<UserUpdateWithoutJobApplicationsInput, UserUncheckedUpdateWithoutJobApplicationsInput>
    create: XOR<UserCreateWithoutJobApplicationsInput, UserUncheckedCreateWithoutJobApplicationsInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutJobApplicationsInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutJobApplicationsInput, UserUncheckedUpdateWithoutJobApplicationsInput>
  }

  export type UserUpdateWithoutJobApplicationsInput = {
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    resumes?: ResumeUpdateManyWithoutUserNestedInput
    oneClickJobs?: OneClickJobUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutJobApplicationsInput = {
    id?: IntFieldUpdateOperationsInput | number
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    resumes?: ResumeUncheckedUpdateManyWithoutUserNestedInput
    oneClickJobs?: OneClickJobUncheckedUpdateManyWithoutUserNestedInput
  }

  export type JobDescriptionUpsertWithoutJobApplicationInput = {
    update: XOR<JobDescriptionUpdateWithoutJobApplicationInput, JobDescriptionUncheckedUpdateWithoutJobApplicationInput>
    create: XOR<JobDescriptionCreateWithoutJobApplicationInput, JobDescriptionUncheckedCreateWithoutJobApplicationInput>
    where?: JobDescriptionWhereInput
  }

  export type JobDescriptionUpdateToOneWithWhereWithoutJobApplicationInput = {
    where?: JobDescriptionWhereInput
    data: XOR<JobDescriptionUpdateWithoutJobApplicationInput, JobDescriptionUncheckedUpdateWithoutJobApplicationInput>
  }

  export type JobDescriptionUpdateWithoutJobApplicationInput = {
    fullText?: StringFieldUpdateOperationsInput | string
    source?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type JobDescriptionUncheckedUpdateWithoutJobApplicationInput = {
    id?: IntFieldUpdateOperationsInput | number
    fullText?: StringFieldUpdateOperationsInput | string
    source?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TailoredResumeUpsertWithWhereUniqueWithoutJobApplicationInput = {
    where: TailoredResumeWhereUniqueInput
    update: XOR<TailoredResumeUpdateWithoutJobApplicationInput, TailoredResumeUncheckedUpdateWithoutJobApplicationInput>
    create: XOR<TailoredResumeCreateWithoutJobApplicationInput, TailoredResumeUncheckedCreateWithoutJobApplicationInput>
  }

  export type TailoredResumeUpdateWithWhereUniqueWithoutJobApplicationInput = {
    where: TailoredResumeWhereUniqueInput
    data: XOR<TailoredResumeUpdateWithoutJobApplicationInput, TailoredResumeUncheckedUpdateWithoutJobApplicationInput>
  }

  export type TailoredResumeUpdateManyWithWhereWithoutJobApplicationInput = {
    where: TailoredResumeScalarWhereInput
    data: XOR<TailoredResumeUpdateManyMutationInput, TailoredResumeUncheckedUpdateManyWithoutJobApplicationInput>
  }

  export type CoverLetterUpsertWithWhereUniqueWithoutJobApplicationInput = {
    where: CoverLetterWhereUniqueInput
    update: XOR<CoverLetterUpdateWithoutJobApplicationInput, CoverLetterUncheckedUpdateWithoutJobApplicationInput>
    create: XOR<CoverLetterCreateWithoutJobApplicationInput, CoverLetterUncheckedCreateWithoutJobApplicationInput>
  }

  export type CoverLetterUpdateWithWhereUniqueWithoutJobApplicationInput = {
    where: CoverLetterWhereUniqueInput
    data: XOR<CoverLetterUpdateWithoutJobApplicationInput, CoverLetterUncheckedUpdateWithoutJobApplicationInput>
  }

  export type CoverLetterUpdateManyWithWhereWithoutJobApplicationInput = {
    where: CoverLetterScalarWhereInput
    data: XOR<CoverLetterUpdateManyMutationInput, CoverLetterUncheckedUpdateManyWithoutJobApplicationInput>
  }

  export type JobApplicationCreateWithoutJobDescriptionInput = {
    source?: string
    jobrightJobId?: string | null
    title: string
    company: string
    location?: string | null
    jobType?: $Enums.JobType
    jobrightMatchScore?: number | null
    jobrightBoard?: string | null
    jobrightUrl?: string | null
    externalUrl: string
    status?: $Enums.ApplicationStatus
    invitedToInterview?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    appliedAt?: Date | string | null
    user: UserCreateNestedOneWithoutJobApplicationsInput
    tailoredResumes?: TailoredResumeCreateNestedManyWithoutJobApplicationInput
    coverLetters?: CoverLetterCreateNestedManyWithoutJobApplicationInput
  }

  export type JobApplicationUncheckedCreateWithoutJobDescriptionInput = {
    id?: number
    userId: number
    source?: string
    jobrightJobId?: string | null
    title: string
    company: string
    location?: string | null
    jobType?: $Enums.JobType
    jobrightMatchScore?: number | null
    jobrightBoard?: string | null
    jobrightUrl?: string | null
    externalUrl: string
    status?: $Enums.ApplicationStatus
    invitedToInterview?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    appliedAt?: Date | string | null
    tailoredResumes?: TailoredResumeUncheckedCreateNestedManyWithoutJobApplicationInput
    coverLetters?: CoverLetterUncheckedCreateNestedManyWithoutJobApplicationInput
  }

  export type JobApplicationCreateOrConnectWithoutJobDescriptionInput = {
    where: JobApplicationWhereUniqueInput
    create: XOR<JobApplicationCreateWithoutJobDescriptionInput, JobApplicationUncheckedCreateWithoutJobDescriptionInput>
  }

  export type JobApplicationUpsertWithoutJobDescriptionInput = {
    update: XOR<JobApplicationUpdateWithoutJobDescriptionInput, JobApplicationUncheckedUpdateWithoutJobDescriptionInput>
    create: XOR<JobApplicationCreateWithoutJobDescriptionInput, JobApplicationUncheckedCreateWithoutJobDescriptionInput>
    where?: JobApplicationWhereInput
  }

  export type JobApplicationUpdateToOneWithWhereWithoutJobDescriptionInput = {
    where?: JobApplicationWhereInput
    data: XOR<JobApplicationUpdateWithoutJobDescriptionInput, JobApplicationUncheckedUpdateWithoutJobDescriptionInput>
  }

  export type JobApplicationUpdateWithoutJobDescriptionInput = {
    source?: StringFieldUpdateOperationsInput | string
    jobrightJobId?: NullableStringFieldUpdateOperationsInput | string | null
    title?: StringFieldUpdateOperationsInput | string
    company?: StringFieldUpdateOperationsInput | string
    location?: NullableStringFieldUpdateOperationsInput | string | null
    jobType?: EnumJobTypeFieldUpdateOperationsInput | $Enums.JobType
    jobrightMatchScore?: NullableFloatFieldUpdateOperationsInput | number | null
    jobrightBoard?: NullableStringFieldUpdateOperationsInput | string | null
    jobrightUrl?: NullableStringFieldUpdateOperationsInput | string | null
    externalUrl?: StringFieldUpdateOperationsInput | string
    status?: EnumApplicationStatusFieldUpdateOperationsInput | $Enums.ApplicationStatus
    invitedToInterview?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    appliedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    user?: UserUpdateOneRequiredWithoutJobApplicationsNestedInput
    tailoredResumes?: TailoredResumeUpdateManyWithoutJobApplicationNestedInput
    coverLetters?: CoverLetterUpdateManyWithoutJobApplicationNestedInput
  }

  export type JobApplicationUncheckedUpdateWithoutJobDescriptionInput = {
    id?: IntFieldUpdateOperationsInput | number
    userId?: IntFieldUpdateOperationsInput | number
    source?: StringFieldUpdateOperationsInput | string
    jobrightJobId?: NullableStringFieldUpdateOperationsInput | string | null
    title?: StringFieldUpdateOperationsInput | string
    company?: StringFieldUpdateOperationsInput | string
    location?: NullableStringFieldUpdateOperationsInput | string | null
    jobType?: EnumJobTypeFieldUpdateOperationsInput | $Enums.JobType
    jobrightMatchScore?: NullableFloatFieldUpdateOperationsInput | number | null
    jobrightBoard?: NullableStringFieldUpdateOperationsInput | string | null
    jobrightUrl?: NullableStringFieldUpdateOperationsInput | string | null
    externalUrl?: StringFieldUpdateOperationsInput | string
    status?: EnumApplicationStatusFieldUpdateOperationsInput | $Enums.ApplicationStatus
    invitedToInterview?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    appliedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    tailoredResumes?: TailoredResumeUncheckedUpdateManyWithoutJobApplicationNestedInput
    coverLetters?: CoverLetterUncheckedUpdateManyWithoutJobApplicationNestedInput
  }

  export type JobApplicationCreateWithoutTailoredResumesInput = {
    source?: string
    jobrightJobId?: string | null
    title: string
    company: string
    location?: string | null
    jobType?: $Enums.JobType
    jobrightMatchScore?: number | null
    jobrightBoard?: string | null
    jobrightUrl?: string | null
    externalUrl: string
    status?: $Enums.ApplicationStatus
    invitedToInterview?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    appliedAt?: Date | string | null
    user: UserCreateNestedOneWithoutJobApplicationsInput
    jobDescription?: JobDescriptionCreateNestedOneWithoutJobApplicationInput
    coverLetters?: CoverLetterCreateNestedManyWithoutJobApplicationInput
  }

  export type JobApplicationUncheckedCreateWithoutTailoredResumesInput = {
    id?: number
    userId: number
    source?: string
    jobrightJobId?: string | null
    title: string
    company: string
    location?: string | null
    jobType?: $Enums.JobType
    jobrightMatchScore?: number | null
    jobrightBoard?: string | null
    jobrightUrl?: string | null
    externalUrl: string
    status?: $Enums.ApplicationStatus
    invitedToInterview?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    appliedAt?: Date | string | null
    jobDescription?: JobDescriptionUncheckedCreateNestedOneWithoutJobApplicationInput
    coverLetters?: CoverLetterUncheckedCreateNestedManyWithoutJobApplicationInput
  }

  export type JobApplicationCreateOrConnectWithoutTailoredResumesInput = {
    where: JobApplicationWhereUniqueInput
    create: XOR<JobApplicationCreateWithoutTailoredResumesInput, JobApplicationUncheckedCreateWithoutTailoredResumesInput>
  }

  export type ResumeCreateWithoutTailoredResumesInput = {
    name: string
    rawText: string
    createdAt?: Date | string
    updatedAt?: Date | string
    user: UserCreateNestedOneWithoutResumesInput
    coverLetters?: CoverLetterCreateNestedManyWithoutBaseResumeInput
  }

  export type ResumeUncheckedCreateWithoutTailoredResumesInput = {
    id?: number
    userId: number
    name: string
    rawText: string
    createdAt?: Date | string
    updatedAt?: Date | string
    coverLetters?: CoverLetterUncheckedCreateNestedManyWithoutBaseResumeInput
  }

  export type ResumeCreateOrConnectWithoutTailoredResumesInput = {
    where: ResumeWhereUniqueInput
    create: XOR<ResumeCreateWithoutTailoredResumesInput, ResumeUncheckedCreateWithoutTailoredResumesInput>
  }

  export type JobApplicationUpsertWithoutTailoredResumesInput = {
    update: XOR<JobApplicationUpdateWithoutTailoredResumesInput, JobApplicationUncheckedUpdateWithoutTailoredResumesInput>
    create: XOR<JobApplicationCreateWithoutTailoredResumesInput, JobApplicationUncheckedCreateWithoutTailoredResumesInput>
    where?: JobApplicationWhereInput
  }

  export type JobApplicationUpdateToOneWithWhereWithoutTailoredResumesInput = {
    where?: JobApplicationWhereInput
    data: XOR<JobApplicationUpdateWithoutTailoredResumesInput, JobApplicationUncheckedUpdateWithoutTailoredResumesInput>
  }

  export type JobApplicationUpdateWithoutTailoredResumesInput = {
    source?: StringFieldUpdateOperationsInput | string
    jobrightJobId?: NullableStringFieldUpdateOperationsInput | string | null
    title?: StringFieldUpdateOperationsInput | string
    company?: StringFieldUpdateOperationsInput | string
    location?: NullableStringFieldUpdateOperationsInput | string | null
    jobType?: EnumJobTypeFieldUpdateOperationsInput | $Enums.JobType
    jobrightMatchScore?: NullableFloatFieldUpdateOperationsInput | number | null
    jobrightBoard?: NullableStringFieldUpdateOperationsInput | string | null
    jobrightUrl?: NullableStringFieldUpdateOperationsInput | string | null
    externalUrl?: StringFieldUpdateOperationsInput | string
    status?: EnumApplicationStatusFieldUpdateOperationsInput | $Enums.ApplicationStatus
    invitedToInterview?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    appliedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    user?: UserUpdateOneRequiredWithoutJobApplicationsNestedInput
    jobDescription?: JobDescriptionUpdateOneWithoutJobApplicationNestedInput
    coverLetters?: CoverLetterUpdateManyWithoutJobApplicationNestedInput
  }

  export type JobApplicationUncheckedUpdateWithoutTailoredResumesInput = {
    id?: IntFieldUpdateOperationsInput | number
    userId?: IntFieldUpdateOperationsInput | number
    source?: StringFieldUpdateOperationsInput | string
    jobrightJobId?: NullableStringFieldUpdateOperationsInput | string | null
    title?: StringFieldUpdateOperationsInput | string
    company?: StringFieldUpdateOperationsInput | string
    location?: NullableStringFieldUpdateOperationsInput | string | null
    jobType?: EnumJobTypeFieldUpdateOperationsInput | $Enums.JobType
    jobrightMatchScore?: NullableFloatFieldUpdateOperationsInput | number | null
    jobrightBoard?: NullableStringFieldUpdateOperationsInput | string | null
    jobrightUrl?: NullableStringFieldUpdateOperationsInput | string | null
    externalUrl?: StringFieldUpdateOperationsInput | string
    status?: EnumApplicationStatusFieldUpdateOperationsInput | $Enums.ApplicationStatus
    invitedToInterview?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    appliedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    jobDescription?: JobDescriptionUncheckedUpdateOneWithoutJobApplicationNestedInput
    coverLetters?: CoverLetterUncheckedUpdateManyWithoutJobApplicationNestedInput
  }

  export type ResumeUpsertWithoutTailoredResumesInput = {
    update: XOR<ResumeUpdateWithoutTailoredResumesInput, ResumeUncheckedUpdateWithoutTailoredResumesInput>
    create: XOR<ResumeCreateWithoutTailoredResumesInput, ResumeUncheckedCreateWithoutTailoredResumesInput>
    where?: ResumeWhereInput
  }

  export type ResumeUpdateToOneWithWhereWithoutTailoredResumesInput = {
    where?: ResumeWhereInput
    data: XOR<ResumeUpdateWithoutTailoredResumesInput, ResumeUncheckedUpdateWithoutTailoredResumesInput>
  }

  export type ResumeUpdateWithoutTailoredResumesInput = {
    name?: StringFieldUpdateOperationsInput | string
    rawText?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutResumesNestedInput
    coverLetters?: CoverLetterUpdateManyWithoutBaseResumeNestedInput
  }

  export type ResumeUncheckedUpdateWithoutTailoredResumesInput = {
    id?: IntFieldUpdateOperationsInput | number
    userId?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    rawText?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    coverLetters?: CoverLetterUncheckedUpdateManyWithoutBaseResumeNestedInput
  }

  export type JobApplicationCreateWithoutCoverLettersInput = {
    source?: string
    jobrightJobId?: string | null
    title: string
    company: string
    location?: string | null
    jobType?: $Enums.JobType
    jobrightMatchScore?: number | null
    jobrightBoard?: string | null
    jobrightUrl?: string | null
    externalUrl: string
    status?: $Enums.ApplicationStatus
    invitedToInterview?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    appliedAt?: Date | string | null
    user: UserCreateNestedOneWithoutJobApplicationsInput
    jobDescription?: JobDescriptionCreateNestedOneWithoutJobApplicationInput
    tailoredResumes?: TailoredResumeCreateNestedManyWithoutJobApplicationInput
  }

  export type JobApplicationUncheckedCreateWithoutCoverLettersInput = {
    id?: number
    userId: number
    source?: string
    jobrightJobId?: string | null
    title: string
    company: string
    location?: string | null
    jobType?: $Enums.JobType
    jobrightMatchScore?: number | null
    jobrightBoard?: string | null
    jobrightUrl?: string | null
    externalUrl: string
    status?: $Enums.ApplicationStatus
    invitedToInterview?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    appliedAt?: Date | string | null
    jobDescription?: JobDescriptionUncheckedCreateNestedOneWithoutJobApplicationInput
    tailoredResumes?: TailoredResumeUncheckedCreateNestedManyWithoutJobApplicationInput
  }

  export type JobApplicationCreateOrConnectWithoutCoverLettersInput = {
    where: JobApplicationWhereUniqueInput
    create: XOR<JobApplicationCreateWithoutCoverLettersInput, JobApplicationUncheckedCreateWithoutCoverLettersInput>
  }

  export type ResumeCreateWithoutCoverLettersInput = {
    name: string
    rawText: string
    createdAt?: Date | string
    updatedAt?: Date | string
    user: UserCreateNestedOneWithoutResumesInput
    tailoredResumes?: TailoredResumeCreateNestedManyWithoutBaseResumeInput
  }

  export type ResumeUncheckedCreateWithoutCoverLettersInput = {
    id?: number
    userId: number
    name: string
    rawText: string
    createdAt?: Date | string
    updatedAt?: Date | string
    tailoredResumes?: TailoredResumeUncheckedCreateNestedManyWithoutBaseResumeInput
  }

  export type ResumeCreateOrConnectWithoutCoverLettersInput = {
    where: ResumeWhereUniqueInput
    create: XOR<ResumeCreateWithoutCoverLettersInput, ResumeUncheckedCreateWithoutCoverLettersInput>
  }

  export type JobApplicationUpsertWithoutCoverLettersInput = {
    update: XOR<JobApplicationUpdateWithoutCoverLettersInput, JobApplicationUncheckedUpdateWithoutCoverLettersInput>
    create: XOR<JobApplicationCreateWithoutCoverLettersInput, JobApplicationUncheckedCreateWithoutCoverLettersInput>
    where?: JobApplicationWhereInput
  }

  export type JobApplicationUpdateToOneWithWhereWithoutCoverLettersInput = {
    where?: JobApplicationWhereInput
    data: XOR<JobApplicationUpdateWithoutCoverLettersInput, JobApplicationUncheckedUpdateWithoutCoverLettersInput>
  }

  export type JobApplicationUpdateWithoutCoverLettersInput = {
    source?: StringFieldUpdateOperationsInput | string
    jobrightJobId?: NullableStringFieldUpdateOperationsInput | string | null
    title?: StringFieldUpdateOperationsInput | string
    company?: StringFieldUpdateOperationsInput | string
    location?: NullableStringFieldUpdateOperationsInput | string | null
    jobType?: EnumJobTypeFieldUpdateOperationsInput | $Enums.JobType
    jobrightMatchScore?: NullableFloatFieldUpdateOperationsInput | number | null
    jobrightBoard?: NullableStringFieldUpdateOperationsInput | string | null
    jobrightUrl?: NullableStringFieldUpdateOperationsInput | string | null
    externalUrl?: StringFieldUpdateOperationsInput | string
    status?: EnumApplicationStatusFieldUpdateOperationsInput | $Enums.ApplicationStatus
    invitedToInterview?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    appliedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    user?: UserUpdateOneRequiredWithoutJobApplicationsNestedInput
    jobDescription?: JobDescriptionUpdateOneWithoutJobApplicationNestedInput
    tailoredResumes?: TailoredResumeUpdateManyWithoutJobApplicationNestedInput
  }

  export type JobApplicationUncheckedUpdateWithoutCoverLettersInput = {
    id?: IntFieldUpdateOperationsInput | number
    userId?: IntFieldUpdateOperationsInput | number
    source?: StringFieldUpdateOperationsInput | string
    jobrightJobId?: NullableStringFieldUpdateOperationsInput | string | null
    title?: StringFieldUpdateOperationsInput | string
    company?: StringFieldUpdateOperationsInput | string
    location?: NullableStringFieldUpdateOperationsInput | string | null
    jobType?: EnumJobTypeFieldUpdateOperationsInput | $Enums.JobType
    jobrightMatchScore?: NullableFloatFieldUpdateOperationsInput | number | null
    jobrightBoard?: NullableStringFieldUpdateOperationsInput | string | null
    jobrightUrl?: NullableStringFieldUpdateOperationsInput | string | null
    externalUrl?: StringFieldUpdateOperationsInput | string
    status?: EnumApplicationStatusFieldUpdateOperationsInput | $Enums.ApplicationStatus
    invitedToInterview?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    appliedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    jobDescription?: JobDescriptionUncheckedUpdateOneWithoutJobApplicationNestedInput
    tailoredResumes?: TailoredResumeUncheckedUpdateManyWithoutJobApplicationNestedInput
  }

  export type ResumeUpsertWithoutCoverLettersInput = {
    update: XOR<ResumeUpdateWithoutCoverLettersInput, ResumeUncheckedUpdateWithoutCoverLettersInput>
    create: XOR<ResumeCreateWithoutCoverLettersInput, ResumeUncheckedCreateWithoutCoverLettersInput>
    where?: ResumeWhereInput
  }

  export type ResumeUpdateToOneWithWhereWithoutCoverLettersInput = {
    where?: ResumeWhereInput
    data: XOR<ResumeUpdateWithoutCoverLettersInput, ResumeUncheckedUpdateWithoutCoverLettersInput>
  }

  export type ResumeUpdateWithoutCoverLettersInput = {
    name?: StringFieldUpdateOperationsInput | string
    rawText?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutResumesNestedInput
    tailoredResumes?: TailoredResumeUpdateManyWithoutBaseResumeNestedInput
  }

  export type ResumeUncheckedUpdateWithoutCoverLettersInput = {
    id?: IntFieldUpdateOperationsInput | number
    userId?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    rawText?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tailoredResumes?: TailoredResumeUncheckedUpdateManyWithoutBaseResumeNestedInput
  }

  export type ResumeCreateManyUserInput = {
    id?: number
    name: string
    rawText: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type JobApplicationCreateManyUserInput = {
    id?: number
    source?: string
    jobrightJobId?: string | null
    title: string
    company: string
    location?: string | null
    jobType?: $Enums.JobType
    jobrightMatchScore?: number | null
    jobrightBoard?: string | null
    jobrightUrl?: string | null
    externalUrl: string
    status?: $Enums.ApplicationStatus
    invitedToInterview?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    appliedAt?: Date | string | null
  }

  export type OneClickJobCreateManyUserInput = {
    id?: number
    source: string
    title: string
    company: string
    externalUrl: string
    fullText: string
    appliedAt?: Date | string | null
    createdAt?: Date | string
  }

  export type ResumeUpdateWithoutUserInput = {
    name?: StringFieldUpdateOperationsInput | string
    rawText?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tailoredResumes?: TailoredResumeUpdateManyWithoutBaseResumeNestedInput
    coverLetters?: CoverLetterUpdateManyWithoutBaseResumeNestedInput
  }

  export type ResumeUncheckedUpdateWithoutUserInput = {
    id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    rawText?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tailoredResumes?: TailoredResumeUncheckedUpdateManyWithoutBaseResumeNestedInput
    coverLetters?: CoverLetterUncheckedUpdateManyWithoutBaseResumeNestedInput
  }

  export type ResumeUncheckedUpdateManyWithoutUserInput = {
    id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    rawText?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type JobApplicationUpdateWithoutUserInput = {
    source?: StringFieldUpdateOperationsInput | string
    jobrightJobId?: NullableStringFieldUpdateOperationsInput | string | null
    title?: StringFieldUpdateOperationsInput | string
    company?: StringFieldUpdateOperationsInput | string
    location?: NullableStringFieldUpdateOperationsInput | string | null
    jobType?: EnumJobTypeFieldUpdateOperationsInput | $Enums.JobType
    jobrightMatchScore?: NullableFloatFieldUpdateOperationsInput | number | null
    jobrightBoard?: NullableStringFieldUpdateOperationsInput | string | null
    jobrightUrl?: NullableStringFieldUpdateOperationsInput | string | null
    externalUrl?: StringFieldUpdateOperationsInput | string
    status?: EnumApplicationStatusFieldUpdateOperationsInput | $Enums.ApplicationStatus
    invitedToInterview?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    appliedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    jobDescription?: JobDescriptionUpdateOneWithoutJobApplicationNestedInput
    tailoredResumes?: TailoredResumeUpdateManyWithoutJobApplicationNestedInput
    coverLetters?: CoverLetterUpdateManyWithoutJobApplicationNestedInput
  }

  export type JobApplicationUncheckedUpdateWithoutUserInput = {
    id?: IntFieldUpdateOperationsInput | number
    source?: StringFieldUpdateOperationsInput | string
    jobrightJobId?: NullableStringFieldUpdateOperationsInput | string | null
    title?: StringFieldUpdateOperationsInput | string
    company?: StringFieldUpdateOperationsInput | string
    location?: NullableStringFieldUpdateOperationsInput | string | null
    jobType?: EnumJobTypeFieldUpdateOperationsInput | $Enums.JobType
    jobrightMatchScore?: NullableFloatFieldUpdateOperationsInput | number | null
    jobrightBoard?: NullableStringFieldUpdateOperationsInput | string | null
    jobrightUrl?: NullableStringFieldUpdateOperationsInput | string | null
    externalUrl?: StringFieldUpdateOperationsInput | string
    status?: EnumApplicationStatusFieldUpdateOperationsInput | $Enums.ApplicationStatus
    invitedToInterview?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    appliedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    jobDescription?: JobDescriptionUncheckedUpdateOneWithoutJobApplicationNestedInput
    tailoredResumes?: TailoredResumeUncheckedUpdateManyWithoutJobApplicationNestedInput
    coverLetters?: CoverLetterUncheckedUpdateManyWithoutJobApplicationNestedInput
  }

  export type JobApplicationUncheckedUpdateManyWithoutUserInput = {
    id?: IntFieldUpdateOperationsInput | number
    source?: StringFieldUpdateOperationsInput | string
    jobrightJobId?: NullableStringFieldUpdateOperationsInput | string | null
    title?: StringFieldUpdateOperationsInput | string
    company?: StringFieldUpdateOperationsInput | string
    location?: NullableStringFieldUpdateOperationsInput | string | null
    jobType?: EnumJobTypeFieldUpdateOperationsInput | $Enums.JobType
    jobrightMatchScore?: NullableFloatFieldUpdateOperationsInput | number | null
    jobrightBoard?: NullableStringFieldUpdateOperationsInput | string | null
    jobrightUrl?: NullableStringFieldUpdateOperationsInput | string | null
    externalUrl?: StringFieldUpdateOperationsInput | string
    status?: EnumApplicationStatusFieldUpdateOperationsInput | $Enums.ApplicationStatus
    invitedToInterview?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    appliedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type OneClickJobUpdateWithoutUserInput = {
    source?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    company?: StringFieldUpdateOperationsInput | string
    externalUrl?: StringFieldUpdateOperationsInput | string
    fullText?: StringFieldUpdateOperationsInput | string
    appliedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OneClickJobUncheckedUpdateWithoutUserInput = {
    id?: IntFieldUpdateOperationsInput | number
    source?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    company?: StringFieldUpdateOperationsInput | string
    externalUrl?: StringFieldUpdateOperationsInput | string
    fullText?: StringFieldUpdateOperationsInput | string
    appliedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OneClickJobUncheckedUpdateManyWithoutUserInput = {
    id?: IntFieldUpdateOperationsInput | number
    source?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    company?: StringFieldUpdateOperationsInput | string
    externalUrl?: StringFieldUpdateOperationsInput | string
    fullText?: StringFieldUpdateOperationsInput | string
    appliedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TailoredResumeCreateManyBaseResumeInput = {
    id?: number
    jobApplicationId: number
    llmModel: string
    promptVersion: string
    outputText: string
    createdAt?: Date | string
  }

  export type CoverLetterCreateManyBaseResumeInput = {
    id?: number
    jobApplicationId: number
    llmModel: string
    promptVersion: string
    outputText: string
    createdAt?: Date | string
  }

  export type TailoredResumeUpdateWithoutBaseResumeInput = {
    llmModel?: StringFieldUpdateOperationsInput | string
    promptVersion?: StringFieldUpdateOperationsInput | string
    outputText?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    jobApplication?: JobApplicationUpdateOneRequiredWithoutTailoredResumesNestedInput
  }

  export type TailoredResumeUncheckedUpdateWithoutBaseResumeInput = {
    id?: IntFieldUpdateOperationsInput | number
    jobApplicationId?: IntFieldUpdateOperationsInput | number
    llmModel?: StringFieldUpdateOperationsInput | string
    promptVersion?: StringFieldUpdateOperationsInput | string
    outputText?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TailoredResumeUncheckedUpdateManyWithoutBaseResumeInput = {
    id?: IntFieldUpdateOperationsInput | number
    jobApplicationId?: IntFieldUpdateOperationsInput | number
    llmModel?: StringFieldUpdateOperationsInput | string
    promptVersion?: StringFieldUpdateOperationsInput | string
    outputText?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CoverLetterUpdateWithoutBaseResumeInput = {
    llmModel?: StringFieldUpdateOperationsInput | string
    promptVersion?: StringFieldUpdateOperationsInput | string
    outputText?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    jobApplication?: JobApplicationUpdateOneRequiredWithoutCoverLettersNestedInput
  }

  export type CoverLetterUncheckedUpdateWithoutBaseResumeInput = {
    id?: IntFieldUpdateOperationsInput | number
    jobApplicationId?: IntFieldUpdateOperationsInput | number
    llmModel?: StringFieldUpdateOperationsInput | string
    promptVersion?: StringFieldUpdateOperationsInput | string
    outputText?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CoverLetterUncheckedUpdateManyWithoutBaseResumeInput = {
    id?: IntFieldUpdateOperationsInput | number
    jobApplicationId?: IntFieldUpdateOperationsInput | number
    llmModel?: StringFieldUpdateOperationsInput | string
    promptVersion?: StringFieldUpdateOperationsInput | string
    outputText?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TailoredResumeCreateManyJobApplicationInput = {
    id?: number
    baseResumeId: number
    llmModel: string
    promptVersion: string
    outputText: string
    createdAt?: Date | string
  }

  export type CoverLetterCreateManyJobApplicationInput = {
    id?: number
    baseResumeId?: number | null
    llmModel: string
    promptVersion: string
    outputText: string
    createdAt?: Date | string
  }

  export type TailoredResumeUpdateWithoutJobApplicationInput = {
    llmModel?: StringFieldUpdateOperationsInput | string
    promptVersion?: StringFieldUpdateOperationsInput | string
    outputText?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    baseResume?: ResumeUpdateOneRequiredWithoutTailoredResumesNestedInput
  }

  export type TailoredResumeUncheckedUpdateWithoutJobApplicationInput = {
    id?: IntFieldUpdateOperationsInput | number
    baseResumeId?: IntFieldUpdateOperationsInput | number
    llmModel?: StringFieldUpdateOperationsInput | string
    promptVersion?: StringFieldUpdateOperationsInput | string
    outputText?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TailoredResumeUncheckedUpdateManyWithoutJobApplicationInput = {
    id?: IntFieldUpdateOperationsInput | number
    baseResumeId?: IntFieldUpdateOperationsInput | number
    llmModel?: StringFieldUpdateOperationsInput | string
    promptVersion?: StringFieldUpdateOperationsInput | string
    outputText?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CoverLetterUpdateWithoutJobApplicationInput = {
    llmModel?: StringFieldUpdateOperationsInput | string
    promptVersion?: StringFieldUpdateOperationsInput | string
    outputText?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    baseResume?: ResumeUpdateOneWithoutCoverLettersNestedInput
  }

  export type CoverLetterUncheckedUpdateWithoutJobApplicationInput = {
    id?: IntFieldUpdateOperationsInput | number
    baseResumeId?: NullableIntFieldUpdateOperationsInput | number | null
    llmModel?: StringFieldUpdateOperationsInput | string
    promptVersion?: StringFieldUpdateOperationsInput | string
    outputText?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CoverLetterUncheckedUpdateManyWithoutJobApplicationInput = {
    id?: IntFieldUpdateOperationsInput | number
    baseResumeId?: NullableIntFieldUpdateOperationsInput | number | null
    llmModel?: StringFieldUpdateOperationsInput | string
    promptVersion?: StringFieldUpdateOperationsInput | string
    outputText?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }



  /**
   * Aliases for legacy arg types
   */
    /**
     * @deprecated Use UserCountOutputTypeDefaultArgs instead
     */
    export type UserCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = UserCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use ResumeCountOutputTypeDefaultArgs instead
     */
    export type ResumeCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = ResumeCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use JobApplicationCountOutputTypeDefaultArgs instead
     */
    export type JobApplicationCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = JobApplicationCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use UserDefaultArgs instead
     */
    export type UserArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = UserDefaultArgs<ExtArgs>
    /**
     * @deprecated Use OneClickJobDefaultArgs instead
     */
    export type OneClickJobArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = OneClickJobDefaultArgs<ExtArgs>
    /**
     * @deprecated Use ResumeDefaultArgs instead
     */
    export type ResumeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = ResumeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use JobApplicationDefaultArgs instead
     */
    export type JobApplicationArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = JobApplicationDefaultArgs<ExtArgs>
    /**
     * @deprecated Use JobDescriptionDefaultArgs instead
     */
    export type JobDescriptionArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = JobDescriptionDefaultArgs<ExtArgs>
    /**
     * @deprecated Use TailoredResumeDefaultArgs instead
     */
    export type TailoredResumeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = TailoredResumeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use CoverLetterDefaultArgs instead
     */
    export type CoverLetterArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = CoverLetterDefaultArgs<ExtArgs>
    /**
     * @deprecated Use AppConfigDefaultArgs instead
     */
    export type AppConfigArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = AppConfigDefaultArgs<ExtArgs>
    /**
     * @deprecated Use SkipRuleDefaultArgs instead
     */
    export type SkipRuleArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = SkipRuleDefaultArgs<ExtArgs>
    /**
     * @deprecated Use UserProfileDefaultArgs instead
     */
    export type UserProfileArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = UserProfileDefaultArgs<ExtArgs>
    /**
     * @deprecated Use ScanLogDefaultArgs instead
     */
    export type ScanLogArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = ScanLogDefaultArgs<ExtArgs>
    /**
     * @deprecated Use GenerationLogDefaultArgs instead
     */
    export type GenerationLogArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = GenerationLogDefaultArgs<ExtArgs>

  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}