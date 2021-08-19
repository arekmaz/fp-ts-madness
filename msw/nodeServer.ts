/* eslint-disable import/no-extraneous-dependencies */
import { RequestHandler, rest } from "msw";
import { setupServer } from "msw/node";
import { Gist, Repo, User } from "../index-3";

type GetHandler = Parameters<typeof rest.get>[1];

const sequentialRestGetResponses = (...handlers: GetHandler[]) => {
  let call = 0;

  const handler: GetHandler = (req, res, ctx) =>
    // eslint-disable-next-line no-plusplus
    handlers[Math.min(call++, handlers.length - 1)](req, res, ctx);

  return handler;
};

const requestHandlers: RequestHandler[] = [
  rest.get(
    "http://api.github.com/users/:user",
    sequentialRestGetResponses((req, res, ctx) => {
      const { user } = req.params as { user: string };
      return res(
        ctx.json({
          gists_url: `http://api.github.com/users/${user}/gists`,
          repos_url: `http://api.github.com/users/${user}/repos`,
        } as Partial<User>)
      );
    })
  ),
  rest.get(
    "http://api.github.com/users/:user/gists",
    sequentialRestGetResponses(
      (req, res, ctx) =>
        res(
          ctx.json([
            {
              description: "desc-1",
            },
            {
              description: "desc-2",
            },
          ] as Partial<Gist>[])
        ),
      (req, res, ctx) =>
        res(
          ctx.json([
            {
              description: "desc-3",
            },
            {
              description: "desc-4",
            },
          ] as Partial<Gist>[])
        )
    )
  ),
  rest.get(
    "http://api.github.com/users/:user/repos",
    sequentialRestGetResponses(
      (req, res, ctx) =>
        res(
          ctx.json([
            {
              full_name: "full-name-1",
            },
            {
              full_name: "full-name-2",
            },
          ] as Partial<Repo>[])
        ),
      (req, res, ctx) =>
        res(
          ctx.json([
            {
              full_name: "full-name-1",
            },
            {
              full_name: "full-name-2",
            },
          ] as Partial<Repo>[])
        )
    )
  ),
];

export const startServer = () => setupServer(...requestHandlers);
