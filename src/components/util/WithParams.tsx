import { useParams } from 'react-router-dom';

export default function withParams(Component: any) {
  return (props: any) => {
    const params = useParams();
    return <Component {...props} params={params} />;
  };
}
