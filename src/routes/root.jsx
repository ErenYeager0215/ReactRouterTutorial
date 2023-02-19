import {
  Outlet,
  NavLink,
  useLoaderData,
  Form,
  redirect,
  useNavigation,
  useSubmit,
} from "react-router-dom";
import { getContacts, createContact } from "../contacts";
import { useEffect } from "react";

export async function action() {
  const contact = await createContact();
  return redirect(`/contacts/${contact.id}/edit`);
}

export async function loader({ request }) {
  // ロード時にリクエストされたURLを取得しオブジェクトを生成
  const url = new URL(request.url);
  // URL内のキー"q"に入っている文字列を取得
  const q = url.searchParams.get("q");
  const contacts = await getContacts(q);
  return { contacts, q };
}

export default function Root() {
  const { contacts, q } = useLoaderData();
  const navigation = useNavigation();
  useEffect(() => {
    document.getElementById("q").value = q;
  }, [q]);
  const submit = useSubmit();
  // navigation.locationはデータロード時に「次の表示先URL」を表示する
  const searching =
    navigation.location &&
    new URLSearchParams(navigation.location.search).has("q");
  console.log(navigation);
  return (
    <>
      <div id="sidebar">
        <h1>React Router Contacts</h1>
        <div>
          <Form id="search-form" role="search">
            <input
              id="q"
              className={searching ? "loading" : ""}
              aria-label="Search contacts"
              placeholder="Search"
              type="search"
              // nameはクエリパラメータのキーになる
              name="q"
              defaultValue={q}
              //キーストロークごとにフィルタリングされる（自動submit機能）
              // この機能がなくてのキーワード入力後、Enterで検索できる
              onChange={(event) => {
                // qのパラメータがnullだったらtrueを返す
                const isFirstSearch = q == null;
                // キーストロークで常にsubmitされているので、履歴スタック（ブラウザバックのページの数）
                // がどんどん増えていく。
                // replace:falseの時はsubmitされるたびに履歴スタックがたまる
                // なのでq==null（はじめの検索）の時は!true=falseとなり履歴スタックがたまり、
                // q==nullがfalseの時は履歴スタックがたまらなくなる。
                // そのため、一回のブラウザバックで初めの検索の時のページまで戻れる
                submit(event.currentTarget.form, { replace: !isFirstSearch });
              }}
            />
            <div id="search-spinner" aria-hidden hidden={!searching} />
            <div className="sr-only" aria-live="polite"></div>
          </Form>
          <Form method="post">
            <button type="submit">New</button>
          </Form>
        </div>
        <nav>
          {contacts.length ? (
            <ul>
              {contacts.map((contact) => (
                <li key={contact.id}>
                  <NavLink
                    to={`contacts/${contact.id}`}
                    className={({ isActive, isPending }) =>
                      isActive ? "active" : isPending ? "pending" : ""
                    }
                  >
                    {contact.first || contact.last ? (
                      <>
                        {contact.first} {contact.last}
                      </>
                    ) : (
                      <i>No Name</i>
                    )}{" "}
                    {contact.favorite && <span>★</span>}
                  </NavLink>
                </li>
              ))}
            </ul>
          ) : (
            <p>
              <i>No contacts</i>
            </p>
          )}
        </nav>
      </div>
      <div
        id="detail"
        className={navigation.state === "loading" ? "loading" : ""}
      >
        <Outlet />
      </div>
    </>
  );
}
