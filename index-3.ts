import axios, { AxiosError, AxiosResponse } from "axios";
import { apply, taskEither } from "fp-ts";
import { pipe } from "fp-ts/function";
import {
  prop,
  map,
  concat,
  replace,
  isEmpty,
  filter,
  complement,
  flatten,
} from "ramda";

const log = <A>(x: A): A => {
  // eslint-disable-next-line no-console
  console.log(x);
  return x;
};

export interface Gist {
  url: string;
  forks_url: string;
  commits_url: string;
  id: string;
  node_id: string;
  git_pull_url: string;
  git_push_url: string;
  html_url: string;
  files: {}[];
  public: boolean;
  created_at: string;
  updated_at: string;
  description: string;
  comments: number;
  user: unknown;
  comments_url: string;
  owner: {}[];
  truncated: boolean;
}

export interface User {
  login: string;
  id: number;
  node_id: string;
  avatar_url: string;
  gravatar_id: string;
  url: string;
  html_url: string;
  followers_url: string;
  following_url: string;
  gists_url: string;
  starred_url: string;
  subscriptions_url: string;
  organizations_url: string;
  repos_url: string;
  events_url: string;
  received_events_url: string;
  type: string;
  site_admin: false;
  name: string | null;
  company: string | null;
  blog: string;
  location: string | null;
  email: string | null;
  hireable: string | null;
  bio: string | null;
  twitter_username: string | null;
  public_repos: number;
  public_gists: number;
  followers: number;
  following: number;
  created_at: string;
  updated_at: string;
}

export interface Repo {
  full_name: string;
  name: string;
}
const httpGet = <T>(url: string) =>
  taskEither.tryCatch<AxiosError, AxiosResponse<T>>(
    () => axios.get(url),
    (reason) => reason as AxiosError
  );
const getUserData = (userName: string) =>
  pipe(userName, concat("http://api.github.com/users/"), (url) =>
    httpGet<User>(url)
  );

export const main = async () => {
  const names = ["arekmaz", "matmat"];

  return pipe(
    names,
    map((name) => getUserData(name)),
    taskEither.sequenceArray,
    taskEither.chain((responses) =>
      apply.sequenceS(taskEither.ApplyPar)({
        gists: pipe(
          responses,
          map((response) =>
            pipe(
              response,
              prop("data"),
              prop("gists_url"),
              log,
              replace("{/gist_id}", ""),
              (url) => httpGet<Gist[]>(url),
              taskEither.map((r) =>
                pipe(
                  r,
                  prop("data"),
                  map(prop("description")),
                  filter(complement(isEmpty))
                )
              )
            )
          ),
          taskEither.sequenceArray,
          taskEither.map(flatten)
        ),
        repos: pipe(
          responses,
          map((response) =>
            pipe(
              response,
              prop("data"),
              prop("repos_url"),
              log,
              (url) => httpGet<Repo[]>(url),
              taskEither.map((r) =>
                pipe(
                  r,
                  prop("data"),
                  map(prop("full_name")),
                  filter(complement(isEmpty))
                )
              )
            )
          ),
          taskEither.sequenceArray,
          taskEither.map(flatten)
        ),
      })
    ),
    taskEither.map(log),
    taskEither.mapLeft((e) => log(`an error occured ${e.message}`))
  )();
};
