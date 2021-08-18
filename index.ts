import axios, { AxiosError } from "axios";
import { array, string, number, taskEither, option, either } from "fp-ts";
import { pipe } from "fp-ts/function";
import { prop, map, path } from "ramda";

const log = <A>(x: A): A => {
  console.log(x);
  return x;
};

const also =
  <T>(fn: (a: T) => void) =>
  (a: T) => {
    fn(a);
    return a;
  };

const pathOption =
  <R>(p: string[]) =>
  (o: object): option.Option<R> =>
    path(p, o) ? option.of(path(p, o) as R) : option.none;

const sliceTo = <T>(ind: number, arr: T[]) =>
  array.takeRight(number.MagmaSub.concat(array.size(arr), ind))(arr);

const main = (argv: string[]) =>
  pipe(
    argv,
    (arr) => sliceTo(2, arr),
    array.map((username) =>
      pipe(
        username,
        also((un) => log(string.Semigroup.concat("username: ", un))),
        log,
        (username) =>
          string.Semigroup.concat("http://api.github.com/users/", username),
        (url) =>
          taskEither.tryCatch(
            () => axios.get<{ gists_url: string }>(url),
            (e) => (e as AxiosError).toJSON()
          )
      )
    ),
    taskEither.sequenceArray
  )().then((e) =>
    pipe(
      e,
      either.fold(log, (responses) =>
        pipe(
          responses,
          map((resp) =>
            pipe(
              resp,
              pathOption<string>(["data", "gists_url"]),
              either.fromOption(() => either.left("error")),
              taskEither.fromEither,
              taskEither.chain((templ) =>
                pipe(templ, log, string.replace("{/gist_id}", ""), log, (url) =>
                  taskEither.tryCatch(
                    () => axios.get<{ description: string }[]>(url),
                    (e) => (e as AxiosError).toJSON()
                  )
                )
              )
            )
          ),
          taskEither.sequenceArray
        )().then((eith) =>
          pipe(
            eith,
            either.fold(log, (responses) =>
              pipe(
                responses,
                map((r) =>
                  pipe(
                    r,
                    prop("data"),
                    map((gist) =>
                      pipe(
                        gist,
                        prop("description"),
                        option.fromPredicate((s) => s.length > 0),
                        option.map(log)
                      )
                    )
                  )
                )
              )
            )
          )
        )
      )
    )
  );

main(process.argv);
