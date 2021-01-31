import { Navbar } from '../components/Navbar';
import { createUrqlClient } from '../utils/createUrqlClient';
import { withUrqlClient } from 'next-urql';
import { usePostsQuery } from '../generated/graphql';

const Index = () => {
	const [ { fetching, data } ] = usePostsQuery();
	return (
		<div>
			<Navbar />
			hello word
			<br />
			{!data ? <p>loading</p> : data.posts.map((post) => <h3>{post.title}</h3>)}
		</div>
	);
};

export default withUrqlClient(createUrqlClient, { ssr: false })(Index);
