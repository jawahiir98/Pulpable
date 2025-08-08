interface Props {
  params: Promise<{
    projectId: string;
  }>;
}

const ProjectIdPage = async ({ params }: Props) => {
  const { projectId } = await params;
  return (
    <div>
      <div className="">Project ID: {projectId}</div>
    </div>
  );
};
export default ProjectIdPage;
